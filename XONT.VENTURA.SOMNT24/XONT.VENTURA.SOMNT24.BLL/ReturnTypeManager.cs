using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using XONT.Common.Message;

namespace XONT.VENTURA.SOMNT24
{
    public class ReturnTypeManager : IReturnTypeManager
    {
        private readonly ReturnTypeDAL dal;
        private DataTable dTable;
        private ReturnType rtntype;

        public ReturnTypeManager()
        {
            dal = new ReturnTypeDAL();
        }

        public DataTable ExistTransactionBLL(string businessUnit, string ExistReturn, ref MessageSet message)
        {
            return dal.ExistTransactionDAL(businessUnit, ExistReturn, ref message);
        }

        public ReturnType SeletedReturnType(string businessUnit, string moduleCode, string returnType, ref MessageSet message)
        {
            rtntype = dal.SeletedReturnType(businessUnit, moduleCode, returnType, ref message);
            return rtntype;
        }

        public void UpdateReturnType(string businessUnit, string userName, string executionType, ReturnType rtnType, ref MessageSet _msg, ref string update)
        {
            dal.UpdateReturnType(businessUnit, userName, executionType, rtnType, ref _msg, ref update);
        }

        public DataTable GetGridData(Selection selected, out int rowCount, ref MessageSet msg)
        {
            dTable = dal.GetGridData(selected, out rowCount, ref msg);
            return dTable;
        }

        public DataTable GetModulePromptData(string businessUnit, ref MessageSet message)
        {
            dTable = dal.GetModulePromptData(businessUnit, ref message);
            return dTable;
        }

        public DataTable GetModulePromptDataForNew(string businessUnit, ref MessageSet message)
        {
            dTable = dal.GetModulePromptData(businessUnit, ref message);
            return dTable;
        }

        public DataTable GetCategoryPromptData(string businessUnit, ref MessageSet message)
        {
            dTable = dal.GetCategoryPromptData(businessUnit, ref message);
            return dTable;
        }
    }
}