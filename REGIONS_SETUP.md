# Regionen-Verwaltung in Supabase

## Tabelle erstellen

1. Gehe zu deinem Supabase Dashboard → Table Editor
2. Erstelle eine neue Tabelle namens `regions` mit folgenden Feldern:

   - `id` (uuid, Primary Key, Default: `gen_random_uuid()`)
   - `name` (text, Not Null) - z.B. "Berlin", "Hamburg", "München"
   - `is_active` (boolean, Not Null, Default: `true`)

3. Optional: Füge ein `created_at` Feld hinzu (timestamp, Default: `now()`)

## Regionen hinzufügen

Du kannst Regionen direkt im Table Editor hinzufügen oder über SQL:

```sql
INSERT INTO regions (name, is_active) VALUES
  ('Berlin', true),
  ('Hamburg', true),
  ('München', true),
  ('Köln', true),
  ('Frankfurt am Main', true);
```

## Regionen deaktivieren

Um eine Region temporär zu verstecken (ohne sie zu löschen), setze `is_active` auf `false`.

## Fallback-Liste

Falls die Supabase-Tabelle nicht verfügbar ist oder leer ist, wird automatisch eine Fallback-Liste mit 10 deutschen Großstädten verwendet. Diese ist in `src/lib/regions.ts` definiert.

