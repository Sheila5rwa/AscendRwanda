const db = require('../models');
const Certificate = db.Certificate;
const User = db.User;
const Module = db.Module;

// ─── FR 3.2: Public Certificate Verification by QR Token ─────────────────────
exports.verifyCertificate = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ message: 'Token is required.' });

    const cert = await Certificate.findOne({
      where: { qr_code: token },
      include: [
        {
          model: User,
          attributes: ['first_name', 'last_name', 'email', 'national_id'],
        },
        {
          model: Module,
          attributes: ['title', 'description', 'language'],
        },
      ],
    });

    if (!cert) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found or invalid QR token.',
      });
    }

    res.status(200).json({
      valid: true,
      certificate: {
        certificate_id: cert.certificate_id,
        issued_at: cert.issued_at,
        student: {
          name: `${cert.User.first_name} ${cert.User.last_name}`,
          national_id: cert.User.national_id || 'N/A',
        },
        module: {
          title: cert.Module.title,
          description: cert.Module.description,
          language: cert.Module.language,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
