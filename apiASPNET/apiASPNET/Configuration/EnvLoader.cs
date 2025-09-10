using System.Text;

namespace apiASPNET.Configuration;

public static class EnvLoader
{
    public static void Load(string? path = null)
    {
        try
        {
            path ??= Path.Combine(Directory.GetCurrentDirectory(), ".env");
            if (!File.Exists(path)) return;

            foreach (var raw in File.ReadAllLines(path, Encoding.UTF8))
            {
                var line = raw.Trim();
                if (string.IsNullOrWhiteSpace(line)) continue;
                if (line.StartsWith("#")) continue;
                int eq = line.IndexOf('=');
                if (eq <= 0) continue;
                var key = line[..eq].Trim();
                var value = line[(eq + 1)..].Trim();
                if ((value.StartsWith("\"") && value.EndsWith("\"")) ||
                    (value.StartsWith("'") && value.EndsWith("'")))
                {
                    value = value[1..^1];
                }
                Environment.SetEnvironmentVariable(key, value);
            }
        }
        catch
        {
            // Silently ignore .env loading errors in production
        }
    }
}

