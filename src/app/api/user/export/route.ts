import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. An authenticated session is required to export data.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Fetch all user-owned records using strictly verified auth.uid()
    const [
      profileRes,
      cycleRes,
      dailyLogsRes,
      customCatRes,
      trackingPrefRes,
      reminderPrefRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase
        .from('cycle_records')
        .select('*')
        .eq('user_id', user.id)
        .order('period_start', { ascending: false }),
      supabase
        .from('daily_logs')
        .select(`
          id,
          log_date,
          moods,
          sleep_duration_minutes,
          sleep_quality,
          energy_level,
          intimacy_logged,
          intimacy_notes,
          notes,
          created_at,
          updated_at,
          daily_symptoms (
            symptom_name,
            severity,
            notes
          )
        `)
        .eq('user_id', user.id)
        .order('log_date', { ascending: false }),
      supabase
        .from('custom_symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('user_tracking_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('reminder_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    const dateSlug = new Date().toISOString().slice(0, 10);

    // If CSV format requested, generate a tabular cycle & wellness report
    if (format === 'csv') {
      const cycleRows = (cycleRes.data || []).map((c: any) =>
        `"${c.period_start}","${c.period_end || 'ongoing'}","${c.flow_intensity || ''}","${(c.notes || '').replace(/"/g, '""')}"`
      );
      const cycleCsv = [
        'PERIOD_START,PERIOD_END,FLOW_INTENSITY,NOTES',
        ...cycleRows,
      ].join('\n');

      const logRows = (dailyLogsRes.data || []).map((l: any) => {
        const symptomsStr = (l.daily_symptoms || [])
          .map((s: any) => `${s.symptom_name} (${s.severity})`)
          .join('; ');
        const moodsStr = (l.moods || []).join('; ');
        return `"${l.log_date}","${moodsStr}","${l.sleep_duration_minutes ?? ''}","${l.sleep_quality ?? ''}","${l.energy_level ?? ''}","${l.intimacy_logged ? 'yes' : 'no'}","${symptomsStr}","${(l.notes || '').replace(/"/g, '""')}"`;
      });
      const wellnessCsv = [
        'LOG_DATE,MOODS,SLEEP_MINUTES,SLEEP_QUALITY,ENERGY_LEVEL_1_TO_5,INTIMACY_LOGGED,SYMPTOMS,NOTES',
        ...logRows,
      ].join('\n');

      const fullCsv = `# OVIARE CYCLE RECORDS\n${cycleCsv}\n\n# OVIARE DAILY WELLNESS LOGS\n${wellnessCsv}`;

      return new NextResponse(fullCsv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="oviare-data-export-${dateSlug}.csv"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // Default JSON export format
    const exportData = {
      app: 'Oviare',
      tagline: 'Understand your rhythm.',
      export_version: '1.0',
      export_timestamp: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profileRes.data || null,
      cycle_records: cycleRes.data || [],
      daily_wellness_logs: dailyLogsRes.data || [],
      custom_categories: customCatRes.data || [],
      tracking_preferences: trackingPrefRes.data || null,
      reminder_preferences: reminderPrefRes.data || null,
      record_summary: {
        cycles_count: (cycleRes.data || []).length,
        daily_logs_count: (dailyLogsRes.data || []).length,
        custom_categories_count: (customCatRes.data || []).length,
      },
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="oviare-data-export-${dateSlug}.json"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
