using System.Security.Claims;

namespace Depo.Data.Model
{
    public static class DepoClaimTypes
    {
        public const string Id = "id";
        public const string Name = ClaimTypes.Name;
        public const string Email = ClaimTypes.Email;
        public const string Role = ClaimTypes.Role;
        public const string Permission = "permission";
        public const string Version = "version";
    }
}
