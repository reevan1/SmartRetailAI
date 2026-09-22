using Microsoft.EntityFrameworkCore;

namespace SmartRetailAI.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
}