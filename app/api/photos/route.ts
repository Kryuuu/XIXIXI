import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PICT_DIR = path.join(process.cwd(), 'public', 'pict');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kimilatte123';
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

// Ensure directory exists
function ensureDir() {
  if (!fs.existsSync(PICT_DIR)) {
    fs.mkdirSync(PICT_DIR, { recursive: true });
  }
}

// GET - List all photos
export async function GET() {
  try {
    ensureDir();
    const files = fs.readdirSync(PICT_DIR);
    const photos = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ALLOWED_EXTENSIONS.includes(ext);
      })
      .map((file) => {
        const stats = fs.statSync(path.join(PICT_DIR, file));
        return {
          src: `/pict/${file}`,
          filename: file,
          alt: file.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    return NextResponse.json({ photos, count: photos.length });
  } catch (error) {
    console.error('Error listing photos:', error);
    return NextResponse.json({ error: 'Failed to list photos' }, { status: 500 });
  }
}

// POST - Upload new photo(s)
export async function POST(request: NextRequest) {
  try {
    // Check password
    const password = request.headers.get('x-admin-password');
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    ensureDir();
    const formData = await request.formData();
    const files = formData.getAll('photos');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploaded: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        errors.push('Invalid file entry');
        continue;
      }

      // Validate extension
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        errors.push(`${file.name}: unsupported format (${ext})`);
        continue;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: too large (max 15MB)`);
        continue;
      }

      // Generate unique filename to prevent overwrite
      let filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const baseName = filename.replace(/\.[^.]+$/, '');
      const finalExt = path.extname(filename);
      let finalPath = path.join(PICT_DIR, filename);

      // If file exists, add timestamp suffix
      if (fs.existsSync(finalPath)) {
        filename = `${baseName}_${Date.now()}${finalExt}`;
        finalPath = path.join(PICT_DIR, filename);
      }

      // Write file
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(finalPath, buffer);
      uploaded.push(filename);
    }

    return NextResponse.json({
      uploaded,
      errors,
      message: `${uploaded.length} photo(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// DELETE - Remove a photo
export async function DELETE(request: NextRequest) {
  try {
    const password = request.headers.get('x-admin-password');
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename } = await request.json();
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    // Security: prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(PICT_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    return NextResponse.json({ message: `${safeName} deleted` });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
