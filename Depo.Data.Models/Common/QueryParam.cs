using Newtonsoft.Json;

namespace Depo.Api.Model.Common
{
    public class QueryParam<T>
    {
        public string Filter { get; set; }

        public T FilterData
        {
            get
            {
                if (string.IsNullOrEmpty(Filter)) Filter = "";
                return JsonConvert.DeserializeObject<T>(Filter);
            }
        }

        public string SortOrder { get; set; }

        public string SortField { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }
    }
}
