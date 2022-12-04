using Minio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Minio
{
    public class MinioConnection
    {
        private MinioSettings _settings;


        public MinioClient Client { get; private set; }


        public MinioConnection(string endpoint, string accessKey, string secretKey)
        {
            _settings = new MinioSettings
            {
                EndPoint = endpoint,
                AccessKey = accessKey,
                SecretKey = secretKey
            };
        }

        public MinioConnection(MinioSettings settings)
        {
            _settings = settings;
        }


        public MinioClient Open()
        {
            //Client = new MinioClient(_settings.EndPoint, _settings.AccessKey, _settings.SecretKey);
            Client = new MinioClient().WithEndpoint(_settings.EndPoint)
                                    .WithCredentials(_settings.AccessKey, _settings.SecretKey)
                                    .Build();

            return Client;
        }
    }
}
