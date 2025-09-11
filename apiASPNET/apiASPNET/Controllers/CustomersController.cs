using apiASPNET.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace apiASPNET.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetAll()
        => await db.Customers.AsNoTracking().OrderBy(c => c.Id).ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Customer>> GetById(int id)
    {
        var c = await db.Customers.FindAsync(id);
        return c is null ? NotFound() : Ok(c);
    }

    [HttpPost]
    public async Task<ActionResult<Customer>> Create(Customer customer)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                  User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (!int.TryParse(sub, out var userId))
        {
            return Forbid();
        }

        customer.CreatedBy = userId; // forzamos el creador
        customer.CreatedAt = DateTime.UtcNow;

        db.Customers.Add(customer);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Customer input)
    {
        if (id != input.Id) return BadRequest();

        var existing = await db.Customers.AsTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (existing is null) return NotFound();

        // No permitir cambiar CreatedBy/CreatedAt
        existing.Name = input.Name;
        existing.Email = input.Email;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await db.Customers.FindAsync(id);
        if (c is null) return NotFound();
        db.Customers.Remove(c);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
