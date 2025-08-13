using FleetManagementSystem4.Services;
using FleetManagementSystem4.Shared.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Reflection;
using System.Runtime.InteropServices;

namespace FleetManagementSystem4
{
    public static class MauiProgram
    {
        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool AllocConsole();

        public static MauiApp CreateMauiApp()
        {
#if WINDOWS
            // Windows에서 콘솔 창 표시 및 한글 인코딩 설정
            AllocConsole();
            System.Console.OutputEncoding = System.Text.Encoding.UTF8;
            System.Console.InputEncoding = System.Text.Encoding.UTF8;
#endif

            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                });

            // Configuration 추가
            var assembly = Assembly.GetExecutingAssembly();
            using var stream = assembly.GetManifestResourceStream("FleetManagementSystem4.appsettings.json");
            if (stream != null)
            {
                var config = new ConfigurationBuilder()
                    .AddJsonStream(stream)
                    .Build();
                builder.Configuration.AddConfiguration(config);
            }

            // Add device-specific services used by the FleetManagementSystem4.Shared project
            builder.Services.AddSingleton<IFormFactor, FormFactor>();
            
            // Supabase 서비스 등록 (appsettings.json에서 설정 읽기)
            builder.Services.AddSingleton<SupabaseService>(provider =>
            {
                // 하드코딩된 값 사용 (MAUI에서 설정 파일 읽기가 복잡하므로)
                return new SupabaseService(
                    "https://eayvdimlksyefznxttma.supabase.co",
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVheXZkaW1sa3N5ZWZ6bnh0dG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTA5MDcsImV4cCI6MjA3MDEyNjkwN30.peXUYGF8tNy7TtEQzfOGGZEPzxEMGAu0NCso8pxV30A"
                );
            });

            // AuthService는 SupabaseService 이후에 등록
            builder.Services.AddSingleton<AuthService>();

            builder.Services.AddMauiBlazorWebView();

#if DEBUG
            builder.Services.AddBlazorWebViewDeveloperTools();
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
