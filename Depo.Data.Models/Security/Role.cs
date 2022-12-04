using Depo.Data.Models.Common;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Depo.Data.Models.Security
{
    public class Role : DbRecordBase
    {
        [StringLength(150)]
        public string RoleName { get; set; }

        [StringLength(2000)]
        public string RolePermissions { get; set; }

        public bool IsDefault { get; set; }

    }
}
