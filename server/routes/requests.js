import express from 'express';
import OutpassRequest from '../models/OutpassRequest.js';

const router = express.Router();

// GET all requests (with optional filtering)
router.get('/', async (req, res) => {
    try {
        const { studentId } = req.query;
        let query = {};
        if (studentId) {
            query.studentId = studentId;
        }
        const requests = await OutpassRequest.find(query).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single request by ID
router.get('/:id', async (req, res) => {
    try {
        const request = await OutpassRequest.findOne({ id: req.params.id });
        if (!request) return res.status(404).json({ message: 'Request not found' });
        res.json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new request
router.post('/', async (req, res) => {
    const request = new OutpassRequest(req.body);
    try {
        const newRequest = await request.save();
        res.status(201).json(newRequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update request status or details
router.put('/:id', async (req, res) => {
    try {
        const updatedRequest = await OutpassRequest.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedRequest) return res.status(404).json({ message: 'Request not found' });
        res.json(updatedRequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET verify pass (for QR scanner)
router.get('/:id/verify', async (req, res) => {
    try {
        const pass = await OutpassRequest.findOne({ id: req.params.id });
        if (!pass) {
            return res.json({ success: false, message: 'Invalid QR Code. Pass not found.' });
        }

        if (pass.status === 'Used') {
            return res.json({ success: false, message: 'Warning: This pass has already been used.', pass });
        }
        if (pass.status === 'Rejected') {
            return res.json({ success: false, message: 'Access Denied: This pass was rejected.', pass });
        }
        if (pass.status === 'Applied' || pass.status === 'Under Progress') {
            return res.json({ success: false, message: 'Access Denied: This pass has not been approved yet.', pass });
        }

        if (pass.status === 'Approved') {
            pass.status = 'Used';
            await pass.save();
            return res.json({ success: true, message: 'Pass Verified! Entry Recorded.', pass });
        }

        res.json({ success: false, message: 'Unknown pass status.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE all requests for a student (used when deleting student account)
// Note: This must come BEFORE the generic /:id route to avoid matching issues
router.delete('/student/:studentId', async (req, res) => {
    try {
        const result = await OutpassRequest.deleteMany({ studentId: req.params.studentId });
        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} request(s) for student ${req.params.studentId}`,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// DELETE a single request by ID
router.delete('/:id', async (req, res) => {
    try {
        const result = await OutpassRequest.findOneAndDelete({ id: req.params.id });
        if (!result) return res.status(404).json({ message: 'Request not found' });
        res.json({ success: true, message: 'Request deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
