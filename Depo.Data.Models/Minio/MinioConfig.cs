using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Minio
{
    public class MinioSettings
    {
        public string EndPoint { get; set; }

        public string AccessKey { get; set; }

        public string SecretKey { get; set; }

        public ICollection<MinioPath> Paths { get; set; }
    }

    public class MinioPath
    {
        public string Type { get; set; }
        public string Bucket { get; set; }
    }
}
