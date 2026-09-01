import PetService from '../services/pet.service.js'

class PetController {
    getAllPets = async (req, res, next) => {
        const { userId } = req.user
        
        return res.status(200).json(await PetService.getAllPetsByUserId(userId))
    }

    addPet = async (req, res, next) => {
        const maKH = req.user?.userId || req.headers['x-client-id'];
        const { name, species, breed, gender, birthDate } = req.body;

        if (!maKH) return res.status(401).json({ message: "Unauthorized" });
        if (!name || !species || !gender || !birthDate) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }

        try {
            await PetService.addPet({ maKH, name, species, breed, gender, birthDate });
            return res.status(201).json({ message: 'Thêm thú cưng thành công' });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

export default new PetController()