import Joi from 'joi';
import { Item } from '../models/Item.js';

// TODO: write a validation schema for create/update per README.md section 2.

const objectId = Joi.string().hex().length(24);

export const createSchema = Joi.object({
  title: Joi.string().trim().min(2).max(60).required(),
  description: Joi.string().trim().allow('').optional(),
  category: Joi.string()
    .valid('electronics', 'clothing', 'documents', 'accessories', 'other')
    .default('other'),
  status: Joi.string()
    .valid('lost', 'found', 'claimed')
    .default('lost'),
  location: Joi.string().trim().allow('').optional(),
  reportedBy: objectId.allow(null).optional(),
});

export const updateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(60),
  description: Joi.string().trim().allow(''),
  category: Joi.string().valid('electronics', 'clothing', 'documents', 'accessories', 'other'),
  status: Joi.string().valid('lost', 'found', 'claimed'),
  location: Joi.string().trim().allow(''),
  reportedBy: objectId.allow(null),
}).min(1);

// GET /api/items
// TODO: implement per README.md section 3.
export async function getAllItems(req, res, next) {
  try {
    const { status, category, search, location } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const items = await Item.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: items.length, items });
  } catch (err) {
    next(err);
  }
}

// GET /api/items/:id
export async function getItem(req, res, next) {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

// POST /api/items
// TODO: implement per README.md section 3.
export async function createItem(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const existing = await Item.findOne({
      title: value.title,
      location: value.location || '',
    });
    if (existing) {
      return res.status(409).json({ message: 'Title already used in same location' });
    }

    const item = await Item.create(value);
    const populatedItem = await item.populate('reportedBy', 'name email');

    res.status(201).json({ item: populatedItem });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Title already used in same location' });
    }
    next(err);
  }
}

// PATCH /api/items/:id
// TODO: implement per README.md section 3.
export async function updateItem(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email');

    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.json({ item });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Title already used in same location' });
    }
    next(err);
  }
}
// DELETE /api/items/:id
// TODO: implement per README.md section 3.
export async function deleteItem(req, res, next) {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// export async function getItems(req, res, next) {
//   try {
//     const { status, category, search, location } = req.query;

//     // Build dynamic MongoDB query object
//     const filter = {};

//     if (status) {
//       filter.status = status;
//     }

//     if (category) {
//       filter.category = category;
//     }

//     if (location) {
//       filter.location = { $regex: location, $options: 'i' }; // Case-insensitive match
//     }

//     if (search) {
//       filter.title = { $regex: search, $options: 'i' }; // Optional title search
//     }

//     // Execute query with populated user details
//     const items = await Item.find(filter)
//       .populate('reportedBy', 'name email')
//       .sort({ createdAt: -1 }); // Sort by newest first

//     res.status(200).json({
//       count: items.length,
//       items,
//     });
//   } catch (err) {
//     next(err);
//   }
// }
