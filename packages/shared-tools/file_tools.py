import os
import subprocess
import sys

try:
    from .base_tool import BaseTool
except ImportError:
    from base_tool import BaseTool

SANDBOX_ROOT = os.getenv("SANDBOX_ROOT", os.path.join(os.path.expanduser("~"), "aic-sandbox"))


class WriteFileTool(BaseTool):
    name = "write_file"
    description = "Write content to a file inside the sandbox directory."

    def input_schema(self) -> dict:
        return {"type": "object", "properties": {
            "path": {"type": "string", "description": "Relative path inside sandbox, e.g. app/main.py"},
            "content": {"type": "string", "description": "File content"},
            "project": {"type": "string", "description": "Project subfolder inside sandbox"},
        }, "required": ["path", "content"]}

    async def run(self, input: dict) -> dict:
        project = input.get("project", "default")
        rel_path = input["path"].lstrip("/\\")
        full_path = os.path.join(SANDBOX_ROOT, project, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(input["content"])
        return {"path": full_path, "bytes_written": len(input["content"])}


class ReadFileTool(BaseTool):
    name = "read_file"
    description = "Read a file from the sandbox directory."

    def input_schema(self) -> dict:
        return {"type": "object", "properties": {
            "path": {"type": "string"},
            "project": {"type": "string"},
        }, "required": ["path"]}

    async def run(self, input: dict) -> dict:
        project = input.get("project", "default")
        rel_path = input["path"].lstrip("/\\")
        full_path = os.path.join(SANDBOX_ROOT, project, rel_path)
        if not os.path.exists(full_path):
            return {"error": f"File not found: {rel_path}"}
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"path": full_path, "content": content, "lines": content.count("\n") + 1}


class RunCommandTool(BaseTool):
    name = "run_command"
    description = "Run a shell command inside the sandbox project directory."

    def input_schema(self) -> dict:
        return {"type": "object", "properties": {
            "command": {"type": "string", "description": "Shell command to run"},
            "project": {"type": "string", "description": "Project subfolder inside sandbox"},
            "timeout": {"type": "integer", "description": "Timeout in seconds", "default": 30},
        }, "required": ["command"]}

    async def run(self, input: dict) -> dict:
        project = input.get("project", "default")
        cwd = os.path.join(SANDBOX_ROOT, project)
        os.makedirs(cwd, exist_ok=True)
        timeout = input.get("timeout", 30)

        try:
            result = subprocess.run(
                input["command"], shell=True, cwd=cwd,
                capture_output=True, text=True, timeout=timeout,
            )
            return {
                "exit_code": result.returncode,
                "stdout": result.stdout[-3000:] if result.stdout else "",
                "stderr": result.stderr[-1000:] if result.stderr else "",
                "success": result.returncode == 0,
            }
        except subprocess.TimeoutExpired:
            return {"exit_code": -1, "error": f"Command timed out after {timeout}s", "success": False}
        except Exception as e:
            return {"exit_code": -1, "error": str(e), "success": False}
