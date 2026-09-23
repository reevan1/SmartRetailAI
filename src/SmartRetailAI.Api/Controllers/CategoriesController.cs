using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRetailAI.Api.Data;
using SmartRetailAI.Api.Dtos;
using SmartRetailAI.Api.Models;

namespace SmartRetailAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        var categories = await dbContext.Categories
            .AsNoTracking()
            .Where(category => category.IsActive)
            .OrderBy(category => category.Name)
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await dbContext.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(category =>
                category.Id == id && category.IsActive);

        if (category is null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(
        CategoryRequest request)
    {
        var name = request.Name.Trim();

        var nameExists = await dbContext.Categories
            .AnyAsync(category =>
                EF.Functions.ILike(category.Name, name));

        if (nameExists)
        {
            return Conflict(new
            {
                message = "A category with this name already exists."
            });
        }

        var category = new Category
        {
            Name = name,
            Description = request.Description?.Trim()
        };

        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCategory),
            new { id = category.Id },
            category);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategory(
        int id,
        CategoryRequest request)
    {
        var category = await dbContext.Categories
            .FirstOrDefaultAsync(category =>
                category.Id == id && category.IsActive);

        if (category is null)
        {
            return NotFound();
        }

        var name = request.Name.Trim();

        var nameExists = await dbContext.Categories
            .AnyAsync(otherCategory =>
                EF.Functions.ILike(otherCategory.Name, name) &&
                otherCategory.Id != id);

        if (nameExists)
        {
            return Conflict(new
            {
                message = "A category with this name already exists."
            });
        }

        category.Name = name;
        category.Description = request.Description?.Trim();
        category.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await dbContext.Categories
            .FirstOrDefaultAsync(category =>
                category.Id == id && category.IsActive);

        if (category is null)
        {
            return NotFound();
        }

        category.IsActive = false;
        category.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}