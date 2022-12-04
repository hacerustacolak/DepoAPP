using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Common
{
    public class EmailConfig
    {
        public string EmailServer { get; set; }
        public int EmailServerPort { get; set; }
        public bool UseTls { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
