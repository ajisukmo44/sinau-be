// create a handler for catalog
const { getAllCatalog, addCatalog, deleteCatalog, getCatalogById, updateCatalog } = require("../models/catalog.model.js");
const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');


// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/catalogs';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation schema for catalog
const catalogSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  price: Joi.number().required().min(0),
  description: Joi.string().optional().allow(''),
  category: Joi.string().required().min(1).max(100),
  is_deleted: Joi.boolean().default(false)
});

exports.getCatalog = async (req, res, next) => {
  // const catalog = await pool.query('SELECT * FROM catalog');
  let filteredCatalog = await getAllCatalog();
  let catalogs = await getAllCatalog();
  try {
    console.log("Fetching items for user:", req);

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filteredCatalog = catalogs.filter(catalog => searchRegex.test(catalog.name));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    const output = {
      message: "List of catalog",
      data: filteredCatalog,
      count: filteredCatalog.length,
      status: "success",
    };
    res.write(JSON.stringify(output));
    res.end();

  } catch (err) {
    res.status(500).json({ message: err, success: false });
  }
}

exports.getCatalogDetail = async (req, res, next) => {
  const id = req.params.id;
  // res.json({id, success: true});
  try {
    const catalogx = await getCatalogById(id);
    const output = {
      message: "Detail of catalog",
      data: catalogx,
      status: "success",
    };
    if (catalogx) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(output));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.write(JSON.stringify({ error: "catalog not found" }));
    }
  } catch (err) {
    res.status(500).json({ message: err, success: false });
  }
  res.end();
}

exports.addCatalogs = async (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
        success: false
      });
    }

    try {
      // Validate request body
      const { error, value } = catalogSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
          success: false
        });
      }

      const newcatalog = {
        name: value.name,
        price: value.price,
        description: value.description || '',
        category: value.category,
        is_deleted: value.is_deleted || false,
        image: req.file ? req.file.filename : null // Save filename to database
      };

      const createdCatalog = await addCatalog(newcatalog);

      const output = {
        message: "Catalog added successfully",
        data: {
          ...createdCatalog,
          image_url: req.file ? `/uploads/catalogs/${req.file.filename}` : null
        },
        status: "success",
      };

      res.status(201).json(output);
    } catch (err) {
      console.error("Error creating catalog:", err);
      // If file was uploaded but database operation failed, delete the file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        message: err.message || "Failed to create catalog item",
        success: false
      });
    }
  });
};

exports.updateCatalogData = async (req, res) => {
  const id = req.params.id;

  // Use multer middleware for single image upload
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
        success: false
      });
    }

    try {
      // Validate request body
      const { error, value } = catalogSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
          success: false
        });
      }

      const updateData = {
        ...value,
        image: req.file ? req.file.filename : undefined // Only update image if new file is uploaded
      };

      const updatedCatalog = await updateCatalog(id, updateData);

      if (!updatedCatalog) {
        return res.status(404).json({
          message: "Catalog not found",
          success: false
        });
      }

      const output = {
        message: "Catalog updated successfully",
        data: {
          ...updatedCatalog,
          image_url: req.file ? `/uploads/catalogs/${req.file.filename}` : null
        },
        status: "success",
      };

      res.json(output);
    } catch (err) {
      console.error("Error updating catalog:", err);
      // If file was uploaded but database operation failed, delete the file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        message: err.message || "Failed to update catalog item",
        success: false
      });
    }
  });
};

exports.deleteCatalog = async (req, res, next) => {
  const idd = req.params.id;
  const deleteCatalogx = await deleteCatalog(idd);
  const output = {
    message: "Catalog deleted successfully",
    status: "success",
  };
  if (deleteCatalogx) {
    res.writeHead(200, { "Content-Type": "application/json" }); // No Content
    res.write(JSON.stringify(output));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ error: "Catalog not found" }));
  }
  res.end();
};

