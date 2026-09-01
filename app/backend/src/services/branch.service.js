import { models } from '../dbs/init.mssql.js'

class BranchService {
    static getAllBranches = async () => await models.CHINHANH.findAll()
}

export default BranchService