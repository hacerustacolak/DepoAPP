using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Security
{
    public class UserRoleViewModel
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public bool Selected { get; set; }
    }
}
