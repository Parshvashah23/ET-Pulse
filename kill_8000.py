import psutil

print("Looking for processes on port 8000...")
for conn in psutil.net_connections():
    if conn.laddr.port == 8000:
        try:
            p = psutil.Process(conn.pid)
            print(f"Killing {conn.pid} ({p.name()})")
            p.kill()
        except psutil.AccessDenied:
            print(f"Access denied for {conn.pid}")
        except Exception as e:
            print(f"Error killing {conn.pid}: {e}")
print("Done.")
