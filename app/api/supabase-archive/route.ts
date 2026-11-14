import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('YOUR_PROJECT_ID')) {
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({
      configured: false,
      synced: false,
      students: [],
      farewellLetters: [],
    });
  }

  try {
    const [{ data: students, error: errStudents }, { data: farewellLetters, error: errLetters }] =
      await Promise.all([
        supabase.from('students').select('*').order('roll_no', { ascending: true }),
        supabase
          .from('farewell_letters')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

    if (errStudents && errLetters) {
      return NextResponse.json({
        configured: true,
        synced: false,
        students: [],
        farewellLetters: [],
      });
    }

    return NextResponse.json({
      configured: true,
      synced: true,
      students: students ?? [],
      farewellLetters: farewellLetters ?? [],
    });
  } catch {
    return NextResponse.json({
      configured: true,
      synced: false,
      students: [],
      farewellLetters: [],
    });
  }
}

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: true, synced: false });
  }

  try {
    const body = await req.json();
    const { action, table, payload, match } = body as {
      action: 'update' | 'insert' | 'delete' | 'update_student_dream';
      table?: 'students' | 'farewell_letters' | 'gallery_photos' | 'announcements' | 'kas_transactions' | 'guestbook';
      payload?: Record<string, unknown>;
      match?: Record<string, unknown>;
    };

    if (action === 'update_student_dream' && payload && payload.id) {
      const { id, ...fields } = payload;
      await supabase.from('students').update(fields).eq('id', id);
      return NextResponse.json({ ok: true, synced: true });
    }

    if (table && action === 'update' && payload && match) {
      await supabase.from(table).update(payload).match(match);
    } else if (table && action === 'insert' && payload) {
      await supabase.from(table).insert([payload]);
    } else if (table && action === 'delete' && match) {
      await supabase.from(table).delete().match(match);
    }

    return NextResponse.json({ ok: true, synced: true });
  } catch {
    return NextResponse.json({ ok: true, synced: false });
  }
}
