using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRetailAI.Api.Data;
using SmartRetailAI.Api.Dtos;
using SmartRetailAI.Api.Models;

namespace SmartRetailAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
        [FromQuery] string? search)
    {
        var query = dbContext.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Where(product => product.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();

            query = query.Where(product =>
                EF.Functions.ILike(product.Name, $"%{searchTerm}%") ||
                EF.Functions.ILike(product.Barcode, $"%{searchTerm}%"));
        }

        var products = await query
            .OrderBy(product => product.Name)
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await dbContext.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .FirstOrDefaultAsync(product =>
                product.Id == id && product.IsActive);

        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpGet("barcode/{barcode}")]
    public async Task<ActionResult<Product>> GetProductByBarcode(
        string barcode)
    {
        var normalizedBarcode = barcode.Trim();

        var product = await dbContext.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .FirstOrDefaultAsync(product =>
                product.Barcode == normalizedBarcode &&
                product.IsActive);

        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(
        ProductRequest request)
    {
        var barcode = request.Barcode.Trim();

        var barcodeExists = await dbContext.Products
            .AnyAsync(product => product.Barcode == barcode);

        if (barcodeExists)
        {
            return Conflict(new
            {
                message = "A product with this barcode already exists."
            });
        }

        Category? category = null;

        if (request.CategoryId.HasValue)
        {
            category = await dbContext.Categories
                .FirstOrDefaultAsync(category =>
                    category.Id == request.CategoryId.Value &&
                    category.IsActive);

            if (category is null)
            {
                return BadRequest(new
                {
                    message = "The selected category does not exist."
                });
            }
        }

        var product = new Product
        {
            Barcode = barcode,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            CategoryId = request.CategoryId,
            Category = category,
            CostPrice = request.CostPrice,
            SellingPrice = request.SellingPrice,
            TaxRate = request.TaxRate,
            MinimumStock = request.MinimumStock,
            ReorderQuantity = request.ReorderQuantity
        };

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetProduct),
            new { id = product.Id },
            product);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(
        int id,
        ProductRequest request)
    {
        var product = await dbContext.Products
            .FirstOrDefaultAsync(product =>
                product.Id == id && product.IsActive);

        if (product is null)
        {
            return NotFound();
        }

        var barcode = request.Barcode.Trim();

        var barcodeExists = await dbContext.Products
            .AnyAsync(otherProduct =>
                otherProduct.Barcode == barcode &&
                otherProduct.Id != id);

        if (barcodeExists)
        {
            return Conflict(new
            {
                message = "A product with this barcode already exists."
            });
        }

        if (request.CategoryId.HasValue)
        {
            var categoryExists = await dbContext.Categories
                .AnyAsync(category =>
                    category.Id == request.CategoryId.Value &&
                    category.IsActive);

            if (!categoryExists)
            {
                return BadRequest(new
                {
                    message = "The selected category does not exist."
                });
            }
        }

        product.Barcode = barcode;
        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim();
        product.CategoryId = request.CategoryId;
        product.CostPrice = request.CostPrice;
        product.SellingPrice = request.SellingPrice;
        product.TaxRate = request.TaxRate;
        product.MinimumStock = request.MinimumStock;
        product.ReorderQuantity = request.ReorderQuantity;
        product.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await dbContext.Products
            .FirstOrDefaultAsync(product =>
                product.Id == id && product.IsActive);

        if (product is null)
        {
            return NotFound();
        }

        product.IsActive = false;
        product.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}