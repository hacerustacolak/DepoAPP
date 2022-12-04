using Depo.Data.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;

namespace Depo.Data.Models.Attributes
{
    public class PermissionRequirementAttribute : TypeFilterAttribute
    {
        public PermissionRequirementAttribute(string only) : base(typeof(PermissionRequirementFilter))
        {
            Arguments = new object[] { only };
        }
    }

    public class PermissionRequirementFilter : IAuthorizationFilter
    {
        readonly string[] _only;

        public PermissionRequirementFilter(string only)
        {
            if (!string.IsNullOrEmpty(only))
            {
                _only = only.Split(",");
            }
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var claims = context.HttpContext.User.Claims.ToList();

            if (_only != null && _only.Length > 0)
            {
                foreach (var o in _only)
                {
                    foreach (var c in claims)
                    {
                        if (c.Type == DepoClaimTypes.Permission && c.Value == o)
                        {
                            return;
                        }
                    }
                }
            }

            context.Result = new StatusCodeResult(403);
        }
    }
}