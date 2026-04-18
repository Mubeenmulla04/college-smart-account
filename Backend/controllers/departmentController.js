import Department from '../../Database/Models/Department.js';

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ error: 'Department not found' });
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, total_students, head_of_department } = req.body;
    const deptId = `${code.toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newDept = new Department({
      deptId,
      name,
      code,
      totalStudents: total_students || 0,
      headOfDepartment: head_of_department
    });
    
    await newDept.save();
    res.status(201).json(newDept);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) return res.status(404).json({ error: 'Department not found' });
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
