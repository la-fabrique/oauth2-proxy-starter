using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Models;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProtectedDataController : ControllerBase
{
    // Liste en mémoire pour le POC avec exemples de données
    private static readonly List<ProtectedData> _data = new()
    {
        new ProtectedData { Id = "1", Description = "Première donnée protégée" },
        new ProtectedData { Id = "2", Description = "Deuxième donnée protégée" },
        new ProtectedData { Id = "3", Description = "Troisième donnée protégée" }
    };

    private readonly ILogger<ProtectedDataController> _logger;

    public ProtectedDataController(ILogger<ProtectedDataController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Récupère toutes les données protégées.
    /// </summary>
    /// <returns>Liste de toutes les données protégées</returns>
    [HttpGet]
    [Authorize(Policy = "protected-data-read")]
    public IEnumerable<ProtectedData> Get()
    {
        return _data;
    }

    /// <summary>
    /// Récupère une donnée protégée par son ID.
    /// </summary>
    /// <param name="id">Identifiant de la donnée protégée</param>
    /// <returns>La donnée protégée correspondante ou 404 si non trouvée</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "protected-data-read")]
    public ActionResult<ProtectedData> Get(string id)
    {
        var protectedData = _data.FirstOrDefault(d => d.Id == id);
        if (protectedData == null)
        {
            return NotFound();
        }
        return Ok(protectedData);
    }

    /// <summary>
    /// Crée une nouvelle donnée protégée.
    /// </summary>
    /// <param name="data">Donnée protégée à créer (l'ID sera généré automatiquement)</param>
    /// <returns>La donnée protégée créée avec le statut 201</returns>
    [HttpPost]
    [Authorize(Policy = "protected-data-write")]
    public ActionResult<ProtectedData> Post(ProtectedData data)
    {
        var newId = (_data.Count + 1).ToString();
        var newData = new ProtectedData
        {
            Id = newId,
            Description = data.Description
        };
        _data.Add(newData);
        return CreatedAtAction(nameof(Get), new { id = newData.Id }, newData);
    }

    /// <summary>
    /// Met à jour une donnée protégée existante.
    /// </summary>
    /// <param name="id">Identifiant de la donnée protégée à mettre à jour</param>
    /// <param name="data">Nouvelles données (l'ID dans le body est ignoré)</param>
    /// <returns>La donnée protégée mise à jour ou 404 si non trouvée</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "protected-data-write")]
    public ActionResult<ProtectedData> Put(string id, ProtectedData data)
    {
        var index = _data.FindIndex(d => d.Id == id);
        if (index == -1)
        {
            return NotFound();
        }
        var updatedData = new ProtectedData
        {
            Id = id,
            Description = data.Description
        };
        _data[index] = updatedData;
        return Ok(updatedData);
    }

    /// <summary>
    /// Supprime une donnée protégée.
    /// </summary>
    /// <param name="id">Identifiant de la donnée protégée à supprimer</param>
    /// <returns>204 No Content si supprimée, 404 si non trouvée</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "protected-data-write")]
    public ActionResult Delete(string id)
    {
        var protectedData = _data.FirstOrDefault(d => d.Id == id);
        if (protectedData == null)
        {
            return NotFound();
        }
        _data.Remove(protectedData);
        return NoContent();
    }
}

