namespace Depo.Data.Models
{
    public class DepoApiResponse
    {
        public bool IsSuccess { get; set; }
        public object Data { get; set; }
        public string  Message { get; set; }
        public string Type { get; set; }

        public DepoApiResponse(bool success)
        {
            this.IsSuccess = success;
            if (success)
            {
                this.Type = DepoApiMessageType.NONE;
                this.Message = "";
            }
            else
            {
                this.Type = DepoApiMessageType.Snack;
                this.Message = "An unexpected error occured.";
            }            
        }

        public DepoApiResponse(bool success, string message)
        {
            this.Type = DepoApiMessageType.NONE;
            this.IsSuccess = success;
            this.Message = message;
        }
    }

    public static class DepoApiMessageType
    {
        public static string NONE = "NONE";
        public static string Form = "FORM";
        public static string Modal = "MODAL";
        public static string Snack = "SNACK";
    }
}
