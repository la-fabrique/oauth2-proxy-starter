using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add Problem Details support for RFC 7807 error responses
builder.Services.AddProblemDetails();

// Add JWT Bearer authentication for Keycloak (not using Microsoft.Identity.Web which is Azure AD specific)
var authority = builder.Configuration["Oidc:Authority"];
var audience = builder.Configuration["Oidc:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = authority;
        options.RequireHttpsMetadata = false; // Allow HTTP for development (Keycloak uses HTTP)
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = authority,
            // Validate audience only if present in token
            // Some Keycloak tokens may not have audience claim (especially when using oauth2-proxy)
            ValidateAudience = false, // Disable audience validation for POC - tokens from oauth2-proxy may not have audience
            // ValidAudiences = new[] { audience, "account" }, // Commented out since ValidateAudience is false
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        
        // Map Keycloak roles to .NET Core role claims
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var claimsIdentity = (ClaimsIdentity?)context.Principal?.Identity;
                if (claimsIdentity == null) return;

                // Extract realm roles from realm_access.roles
                var realmAccessClaim = context.Principal?.FindFirst("realm_access");
                if (realmAccessClaim != null)
                {
                    try
                    {
                        var realmAccess = JsonSerializer.Deserialize<JsonElement>(realmAccessClaim.Value);
                        if (realmAccess.TryGetProperty("roles", out var realmRoles))
                        {
                            foreach (var role in realmRoles.EnumerateArray())
                            {
                                var roleValue = role.GetString();
                                if (!string.IsNullOrEmpty(roleValue))
                                {
                                    claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, roleValue));
                                }
                            }
                        }
                    }
                    catch (JsonException)
                    {
                        // Ignore JSON parsing errors
                    }
                }

                // Extract client roles from resource_access.oauth-starter-client.roles
                var resourceAccessClaim = context.Principal?.FindFirst("resource_access");
                if (resourceAccessClaim != null && !string.IsNullOrEmpty(audience))
                {
                    try
                    {
                        var resourceAccess = JsonSerializer.Deserialize<JsonElement>(resourceAccessClaim.Value);
                        if (resourceAccess.TryGetProperty(audience, out var clientAccess))
                        {
                            if (clientAccess.TryGetProperty("roles", out var clientRoles))
                            {
                                foreach (var role in clientRoles.EnumerateArray())
                                {
                                    var roleValue = role.GetString();
                                    if (!string.IsNullOrEmpty(roleValue))
                                    {
                                        claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, roleValue));
                                    }
                                }
                            }
                        }
                    }
                    catch (JsonException)
                    {
                        // Ignore JSON parsing errors
                    }
                }

                await Task.CompletedTask;
            }
        };
    });

// Add authorization services with policies
builder.Services.AddAuthorization(options =>
{
    // Policy for reading protected data: requires protected-data-read OR protected-data-write OR admin
    // Note: protected-data-write includes read permission (write implies read)
    options.AddPolicy("protected-data-read", policy =>
        policy.RequireAssertion(context =>
            context.User.IsInRole("protected-data-read") ||
            context.User.IsInRole("protected-data-write") ||
            context.User.IsInRole("admin")));
    
    // Policy for writing protected data: requires protected-data-write OR admin
    options.AddPolicy("protected-data-write", policy =>
        policy.RequireAssertion(context =>
            context.User.IsInRole("protected-data-write") ||
            context.User.IsInRole("admin")));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Healthcheck endpoint (accessible without authentication)
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

// Middleware to copy X-Forwarded-Access-Token to Authorization header
// oauth2-proxy sends the JWT token in X-Forwarded-Access-Token when pass_access_token = true
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        var xForwardedToken = context.Request.Headers["X-Forwarded-Access-Token"].ToString();
        var authHeader = context.Request.Headers["Authorization"].ToString();
        
        if (!string.IsNullOrEmpty(xForwardedToken) && string.IsNullOrEmpty(authHeader))
        {
            // Remove "Bearer " prefix if present
            var token = xForwardedToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) 
                ? xForwardedToken.Substring(7) 
                : xForwardedToken;
            context.Request.Headers["Authorization"] = $"Bearer {token}";
        }
    }
    await next();
});

// Authentication and Authorization middleware (order is important)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
