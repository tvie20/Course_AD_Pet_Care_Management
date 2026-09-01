import BranchService from '../services/branch.service.js'

class BranchController {
    
    getAllBranches = async (req, res) => res.status(200).json(await BranchService.getAllBranches())
    
}

export default new BranchController()