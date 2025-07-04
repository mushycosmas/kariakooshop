import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { db } from '../../../../lib/db';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid or missing product ID' });
  }

  const adId = Number(id);

  // -------------------- GET --------------------
  if (req.method === 'GET') {
    try {
      const [productRows] = await db.query('SELECT * FROM ads WHERE id = ?', [adId]);
      if ((productRows as any[]).length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const product = (productRows as any[])[0];
      const [imageRows] = await db.query('SELECT path FROM ad_images WHERE ad_id = ?', [adId]);
      const images = (imageRows as any[]).map(row => row.path);

      return res.status(200).json({ product, images });
    } catch (error) {
      console.error('GET error:', error);
      return res.status(500).json({ message: 'Error fetching product' });
    }
  }

  // -------------------- PUT --------------------
  if (req.method === 'PUT') {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const form = formidable({
      multiples: true,
      keepExtensions: true,
      uploadDir,
      filename: (_name, _ext, part) => `${Date.now()}-${part.originalFilename}`,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse failed:', err);
        return res.status(500).json({ message: 'Form parse failed' });
      }

      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const price = Number(Array.isArray(fields.price) ? fields.price[0] : fields.price);
      const product_description = Array.isArray(fields.product_description)
        ? fields.product_description[0]
        : fields.product_description;
      const status = Array.isArray(fields.status) ? fields.status[0] : fields.status;

      if (!name || isNaN(price) || !product_description || !status) {
        return res.status(400).json({ message: 'Missing or invalid fields' });
      }

      try {
        // 1. Update product
        await db.execute(
          'UPDATE ads SET name = ?, price = ?, product_description = ?, status = ? WHERE id = ?',
          [name.trim(), price, product_description.trim(), status.trim(), adId]
        );

        // 2. Save new uploaded images
        const newImages = files.newImages
          ? Array.isArray(files.newImages)
            ? files.newImages
            : [files.newImages]
          : [];

        const newlyInsertedPaths: string[] = [];

        for (const file of newImages) {
          if (!file || !file.filepath) continue;
          const filename = path.basename(file.filepath);
          const relPath = `/uploads/${filename}`;
          await db.execute('INSERT INTO ad_images (ad_id, path) VALUES (?, ?)', [adId, relPath]);
          newlyInsertedPaths.push(relPath);
        }

        // 3. Get current DB image paths
        const [dbImages] = await db.query('SELECT path FROM ad_images WHERE ad_id = ?', [adId]);
        const dbImagePaths = (dbImages as any[]).map(img => img.path);

        // 4. Get images to keep
        const existingRaw = fields.existingImages || [];
        const existingImages = Array.isArray(existingRaw) ? existingRaw : [existingRaw];
        const keepPaths = [...existingImages, ...newlyInsertedPaths];

        // 5. Delete only removed images
        const toDelete = dbImagePaths.filter(path => !keepPaths.includes(path));
        for (const relPath of toDelete) {
          const fullPath = path.join(process.cwd(), 'public', relPath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
          await db.execute('DELETE FROM ad_images WHERE ad_id = ? AND path = ?', [adId, relPath]);
        }

        return res.status(200).json({ message: 'Product and images updated successfully' });
      } catch (error) {
        console.error('PUT DB error:', error);
        return res.status(500).json({ message: 'Database update failed' });
      }
    });

    return;
  }

  // -------------------- DELETE --------------------
  if (req.method === 'DELETE') {
    try {
      const [imageRows] = await db.query('SELECT path FROM ad_images WHERE ad_id = ?', [adId]);
      const images = (imageRows as any[]).map(row => row.path);

      for (const relPath of images) {
        const fullPath = path.join(process.cwd(), 'public', relPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

      await db.execute('DELETE FROM ad_images WHERE ad_id = ?', [adId]);
      await db.execute('DELETE FROM ads WHERE id = ?', [adId]);

      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('DELETE error:', error);
      return res.status(500).json({ message: 'Failed to delete product' });
    }
  }

  // -------------------- INVALID METHOD --------------------
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
