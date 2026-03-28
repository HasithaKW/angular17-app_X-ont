using System;

namespace XONT.VENTURA.SOMNT24.DTOs
{
    public class ReturnTypeInsertDto
    {
        public string ReturnType { get; set; }
        public string Description { get; set; }
        public string ModuleCode { get; set; }
        public string ModuleCodeDesc { get; set; }
        public string ReturnCategory { get; set; }
        public string CategoryDesc { get; set; }
        public string ReturnValueValidation { get; set; }
        public bool SalableReturn { get; set; }
        public bool DeductFromSales { get; set; }
        public bool Active { get; set; }
        public byte[] TimeStamp { get; set; }  // Make this nullable
        public string pageType { get; set; }

        // Additional properties for stored procedure mapping
        public string BusinessUnit { get; set; }
        public string ProcessingRequired { get; set; }
        public string CreatedBy { get; set; }
        public string LastUpdatedBy { get; set; }
        public string Status { get; set; }
        public string ExecutionType { get; set; }
        public string ReturnDeductionType { get; set; }
        public string ValidateReturnValue { get; set; }
    }
}