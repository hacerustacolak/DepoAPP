using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Security
{
    public class UserRoleModel
    {
        public int UserId { get; set; }
        public List<int> Roles { get; set; }
    }
}
