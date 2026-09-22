using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRetailAI.Api.Data;

namespace SmartRetailAI.Api.Controllers;

[ApiController]
[Route("api/health")]
public class DatabaseHealthController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet("database")]
    public async Task<IActionResult> CheckDatabase()
    {
        var canConnect = await dbContext.Database.CanConnectAsync();

        if (!canConnect)
        {
            return StatusCode(503, new
            {
                status = "Unhealthy",
                database = "PostgreSQL"
            });
        }

        return Ok(new
        {
            status = "Healthy",
            database = "PostgreSQL"
        });
    }
}