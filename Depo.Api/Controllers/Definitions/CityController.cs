using Depo.Data.Models;
using Depo.Data.Models.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Depo.Api.Controllers.Definitions
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CityController : ControllerBase
    {
        private readonly DepoDbContext _context;

        public CityController(DepoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<DepoApiResponse> GetAllCities()
        {
            var res = new DepoApiResponse(false);
            try
            {
                var cities = await _context.City.Where(x => x.IsActive && !x.IsDeleted).OrderBy(p => p.CityName).ToListAsync();

                res = new DepoApiResponse(true);
                res.Data = cities.ToList();
                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }
        }
    }
}
