using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRetailAI.Api.Data;
using SmartRetailAI.Api.Dtos;
using SmartRetailAI.Api.Models;

namespace SmartRetailAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supplier>>> GetSuppliers(
        [FromQuery] string? search)
    {
        var query = dbContext.Suppliers
            .AsNoTracking()
            .Where(supplier => supplier.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();

            query = query.Where(supplier =>
                EF.Functions.ILike(supplier.Name, $"%{searchTerm}%") ||
                (supplier.ContactPerson != null &&
                    EF.Functions.ILike(
                        supplier.ContactPerson,
                        $"%{searchTerm}%")) ||
                (supplier.Email != null &&
                    EF.Functions.ILike(
                        supplier.Email,
                        $"%{searchTerm}%")) ||
                (supplier.Phone != null &&
                    EF.Functions.ILike(
                        supplier.Phone,
                        $"%{searchTerm}%")));
        }

        var suppliers = await query
            .OrderBy(supplier => supplier.Name)
            .ToListAsync();

        return Ok(suppliers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Supplier>> GetSupplier(int id)
    {
        var supplier = await dbContext.Suppliers
            .AsNoTracking()
            .FirstOrDefaultAsync(supplier =>
                supplier.Id == id && supplier.IsActive);

        if (supplier is null)
        {
            return NotFound();
        }

        return Ok(supplier);
    }

    [HttpPost]
    public async Task<ActionResult<Supplier>> CreateSupplier(
        SupplierRequest request)
    {
        var name = request.Name.Trim();

        var nameExists = await dbContext.Suppliers
            .AnyAsync(supplier =>
                EF.Functions.ILike(supplier.Name, name));

        if (nameExists)
        {
            return Conflict(new
            {
                message = "A supplier with this name already exists."
            });
        }

        var supplier = new Supplier
        {
            Name = name,
            ContactPerson = CleanOptionalText(request.ContactPerson),
            Email = CleanOptionalText(request.Email),
            Phone = CleanOptionalText(request.Phone),
            Address = CleanOptionalText(request.Address)
        };

        dbContext.Suppliers.Add(supplier);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetSupplier),
            new { id = supplier.Id },
            supplier);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSupplier(
        int id,
        SupplierRequest request)
    {
        var supplier = await dbContext.Suppliers
            .FirstOrDefaultAsync(supplier =>
                supplier.Id == id && supplier.IsActive);

        if (supplier is null)
        {
            return NotFound();
        }

        var name = request.Name.Trim();

        var nameExists = await dbContext.Suppliers
            .AnyAsync(otherSupplier =>
                EF.Functions.ILike(otherSupplier.Name, name) &&
                otherSupplier.Id != id);

        if (nameExists)
        {
            return Conflict(new
            {
                message = "A supplier with this name already exists."
            });
        }

        supplier.Name = name;
        supplier.ContactPerson =
            CleanOptionalText(request.ContactPerson);
        supplier.Email = CleanOptionalText(request.Email);
        supplier.Phone = CleanOptionalText(request.Phone);
        supplier.Address = CleanOptionalText(request.Address);
        supplier.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var supplier = await dbContext.Suppliers
            .FirstOrDefaultAsync(supplier =>
                supplier.Id == id && supplier.IsActive);

        if (supplier is null)
        {
            return NotFound();
        }

        supplier.IsActive = false;
        supplier.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private static string? CleanOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}