using FleetManagementSystem4.Shared.Services;
using FleetManagementSystem4.Web.Components;
using FleetManagementSystem4.Web.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Add device-specific services used by the FleetManagementSystem4.Shared project
builder.Services.AddSingleton<IFormFactor, FormFactor>();

// Supabase 서비스 등록 (appsettings.json에서 설정 읽기)
builder.Services.AddSingleton<SupabaseService>(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    var supabaseUrl = configuration["Supabase:Url"];
    var supabaseKey = configuration["Supabase:Key"];
    
    if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
    {
        throw new InvalidOperationException("Supabase configuration is missing in appsettings.json");
    }
    
    return new SupabaseService(supabaseUrl, supabaseKey);
});

// AuthService는 SupabaseService 이후에 등록
builder.Services.AddSingleton<AuthService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddAdditionalAssemblies(typeof(FleetManagementSystem4.Shared._Imports).Assembly);

app.Run();
