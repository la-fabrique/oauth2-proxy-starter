namespace Api.Models;

/// <summary>
/// Représente une donnée protégée retournée par l'API.
/// Correspond au type TypeScript ProtectedData du front-end.
/// </summary>
public record ProtectedData
{
    public string Id { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

