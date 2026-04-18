import Scholarship from '../../Database/Models/Scholarship.js';

export const getAllScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ createdAt: -1 });
    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });
    res.json(scholarship);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createScholarship = async (req, res) => {
  try {
    const { name, description, amount, eligibility_criteria, deadline, status } = req.body;
    const scholarshipId = `SCH${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newScholarship = new Scholarship({
      scholarshipId,
      name,
      description,
      amount,
      eligibilityCriteria: eligibility_criteria,
      deadline,
      status: status || 'Active'
    });
    
    await newScholarship.save();
    res.status(201).json(newScholarship);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });
    res.json(scholarship);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
    if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
