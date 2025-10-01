# TreeDown Specification v0.1

**Plain-text family tree markup language**

Invented by Larry McGinty • Implemented in [Family Tree Editor](https://github.com/jbrannigan/family-tree-editor)

---

## Table of Contents

- [Purpose & Scope](#purpose--scope)
- [File Format](#file-format)
- [Core Syntax](#core-syntax)
- [Facts & Events](#facts--events)
- [Indentation & Structure](#indentation--structure)
- [Normalization Rules](#normalization-rules)
- [Validation Rules](#validation-rules)
- [JSON Data Model](#json-data-model)
- [Examples](#examples)
- [Future Extensions](#future-extensions)

---

## Purpose & Scope

TreeDown is a plain-text, tab-indented notation for family trees that prioritizes:

- **Human readability**: Easy to write and edit in any text editor
- **Universal accessibility**: Plain text is archival-friendly and universally compatible
- **Structural clarity**: Indentation shows parent-child relationships at a glance
- **Round-trip fidelity**: Cleanly converts to/from structured JSON for programmatic use

**File extension**: `.txt` (or `.treedown`)
**MIME type**: `text/plain` (informal: `text/treedown`)
**Character encoding**: UTF-8
**Indent unit**: Tab (`\t`) - press the Tab key once per indent level

---

## File Format

### Basic Structure

```treedown
John McGinty & Margaret Kirk (M- 13 July 1894, Scotland)
	James McGinty (1896–1972)
	Eileen (b. 1924) (d. 2008)
	Margaret (Peggy) (b. 1933)
```

- One logical item per line
- Tabs define hierarchy (children indented one level deeper)
- Empty lines are ignored
- Leading/trailing whitespace is trimmed

---

## Core Syntax

### 1. Person Line

**Format**: `<name> [<facts>] [<notes>]`

**Examples**:

```treedown
Eileen McGinty (1924–2008)
James (b. 21 Nov 1956, Cleveland OH) (d. 2012, TX)
Margaret (Peggy) (b. 1933)
```

#### Name Components

- **Given name** (required): First name
- **Middle name** (optional): Middle name or initial
- **Surname** (optional): Last name; if omitted, inherited from nearest ancestor
- **Suffix** (optional): Jr., Sr., III, etc.
- **Nickname** (optional): In parentheses immediately after given name: `Margaret (Peggy)`

#### Name Inheritance Rule

Children automatically inherit the surname of their parent unless:

1. A different surname is explicitly provided
2. The child is part of a marriage/union with a different surname

**Example**:

```treedown
John McGinty & Margaret Kirk
	James McGinty        ← explicit surname
	Eileen               ← inherits "McGinty"
	Margaret (Peggy)     ← inherits "McGinty", nickname in parens
```

### 2. Union (Marriage/Partnership) Line

**Format**: `<person> & <person> [<marriage_facts>] [<status_notes>]`

**Examples**:

```treedown
John McGinty & Margaret Kirk (M- 13 July 1894, Scotland)
Maureen & Dennis Murray (M- 1991, FL) (Div- 2003)
James & Ellen Nimmons
```

#### Union Rules

- Use `&` to join partners (required)
- Marriage facts: `(M- <date>, <place>)`
- Status markers: `(Div)`, `(Sep)`, `(Wid)` for divorced, separated, widowed
- Children of the union are indented beneath it

**Deprecated**: Using `-` as a partner joiner (normalize to `&`)

### 3. Dates

TreeDown supports flexible date formats:

#### Date Formats

- **Full date**: `21 November 1956` or `Nov 21, 1956`
- **Month and year**: `December 1915`
- **Year only**: `1956`
- **Lifespan range**: `1924–2008` (en dash preferred, hyphen accepted)
- **Open-ended**: `1924–` (still living or unknown death date)
- **Approximate**: Use `approx` or `~` prefix: `approx 1850`

#### Date Prefixes

- `b.` — Birth date
- `d.` — Death date
- `M-` — Marriage date
- `Div-` — Divorce date
- `Sep-` — Separation date

**Examples**:

```treedown
James McGinty b.1854 d.1932
Ellen (b. 1856)
Patrick (1924–2008)
```

### 4. Places

Places appear after dates, comma-delimited:

**Format**: `<date>, <city>, <region>, <country>`

**Examples**:

```treedown
b. 21 November 1956, Cleveland, OH
d. 2012, TX
M- 13 July 1894, Scotland
```

Places are stored as structured data:

- `city`: City name
- `region`: State, province, or region (prefer uppercase US state codes: NY, CA, TX)
- `country`: Country name
- `raw`: Original text as written

---

## Facts & Events

### Inline Facts Syntax

Facts are enclosed in parentheses:

#### Life Events

- `(b. <date> [, <place>])` — Birth
- `(d. <date> [, <place>])` — Death
- `(YYYY–YYYY)` — Lifespan shorthand

#### Marriage Events

- `(M- <date> [, <place>])` — Marriage
- `(M-?)` — Marriage date unknown

#### Status Events

- `(Div)` or `(Div- <date>)` — Divorced
- `(Sep)` or `(Sep- <date>)` — Separated
- `(Wid)` or `(Wid- <date>)` — Widowed

#### Special Cases

- `(stillborn)` — Stillbirth
- `(Now <name>)` — Name change
- `(Expecting <description>)` — Expected birth

### Unknown Values

Use `?` for unknown data:

- `(M-?)` — Marriage occurred but date unknown
- `b.?` — Birth date unknown

Parsers should convert `?` to `null` in structured data while preserving the original text.

---

## Indentation & Structure

### Hierarchy Rules

1. **Tabs define depth**: Each child must be exactly one level deeper than its parent
2. **No skipping levels**: Cannot jump from depth 0 to depth 2
3. **Parent context**:
   - Children under a **union line** → children of that union
   - Children under a **person line** → children of that person (single-parent union implied)

### Indentation

- **Use the Tab key**: Press Tab once for each indent level
- **Simple rule**: More indented = child of the line above

**Example**:

```treedown
John & Margaret          ← depth 0
	James                ← depth 1 (child of John & Margaret)
		Mary             ← depth 2 (child of James)
```

---

## Normalization Rules

The parser is forgiving and will accept minor variations, but for best results:

### Recommended Practices

1. **Use Tab key for indentation** - Press Tab once per level
2. **Use `&` between partners** - Not `-` or other symbols
3. **Use en dashes in date ranges** - `1924–2008` (though hyphens work too)
4. **Uppercase US state codes** - `NY`, `CA`, `TX`, etc.
5. **One space between elements** - Avoid multiple spaces
6. **Use UTF-8 encoding** - Most text editors do this by default

---

## Validation Rules

### Structural Validation

1. A line cannot be both a person and union simultaneously
2. Indentation must never skip levels
3. A child must have a parent at the immediately shallower level
4. Only the first parentheses immediately after given name = nickname

### Semantic Validation

1. **Marriage facts** must appear on union lines only
2. **Birth/death facts** must appear on person lines only
3. **Date ranges** should use en dash (–) not hyphen (-)
4. **Unknown markers** (`?`) should be minimal and converted to `null`

### Tips for Clean TreeDown Files

- Use the Tab key (not spaces) for indentation
- Use `&` to join partners (not `-` or `and`)
- Put nicknames in parentheses right after the given name
- Use `b.` and `d.` prefixes for dates to make them clear
- Each person or union should be on its own line

---

## JSON Data Model

TreeDown files convert to a person-first graph with unions as first-class objects.

### Core Entities

1. **Person**: Individual with names, life events, and union references
2. **Union**: Marriage/partnership with partners, events, and children
3. **Meta**: Document metadata (version, parsing rules)

### TypeScript Schema

```typescript
type ID = string;

interface Place {
  city?: string | null;
  region?: string | null; // state/province
  country?: string | null;
  raw?: string | null;
}

interface EventFact {
  date?: string | null; // ISO-8601 if known, else original format
  place?: Place | null;
  approx?: boolean;
  raw?: string | null; // original text
}

interface Life {
  birth?: EventFact | null;
  death?: EventFact | null;
  lifespanRaw?: string | null; // e.g., "1924–2008" for display
}

interface Names {
  given: string;
  middle?: string | null;
  surname?: string | null; // may be inherited
  suffix?: string | null;
  nicknames?: string[];
  display?: string; // cached for UI, e.g., "Margaret (Peggy) McGinty"
}

interface Person {
  id: ID;
  names: Names;
  sex?: 'M' | 'F' | 'X' | null;
  life?: Life | null;
  unions: ID[]; // union IDs this person belongs to
  notes?: string[];
  raw?: string; // original TreeDown line
}

interface Union {
  id: ID;
  partners: ID[]; // typically length 2
  status?: 'married' | 'divorced' | 'separated' | 'widowed' | 'partnered' | 'unknown';
  events?: {
    marriage?: EventFact | null;
    divorce?: EventFact | null;
    separation?: EventFact | null;
    widowhood?: EventFact | null;
  };
  children: ID[]; // person IDs
  notes?: string[];
  raw?: string; // original TreeDown line
}

interface TreeDownDocument {
  people: Person[];
  unions: Union[];
  meta: {
    version: '0.1';
    source?: 'treedown';
    parsingRules: {
      inheritSurname: boolean;
      indentUnit: 'tab';
      spouseSeparator: '&';
    };
  };
}
```

### ID Generation Strategy

Prefer stable, readable IDs:

- **Person**: `p.<given>_<surname>_<year>` (e.g., `p.eileen_mcginty_1924`)
- **Union**: `u.<person1_id>__<person2_id>` (e.g., `u.john_mcginty_1870__margaret_kirk_1871`)
- Use hash or counter for conflicts

### Key Behaviors

1. **Surname inheritance**: If `person.names.surname` is missing, inherit from nearest ancestor
2. **Multiple unions**: A person may belong to multiple unions (remarriage)
3. **Single parent**: Child under person (not union) → synthesize union with one known partner

---

## Examples

### Example 1: Basic Family

```treedown
John McGinty & Margaret Kirk (M- 13 July 1894, Scotland)
	James Lynch McGinty (1896–1972)
	Eileen (b. 1924) (d. 2008)
	James (b. 1929)
	Margaret (Peggy) (b. 1933)
```

**Parsed**:

- Union: John & Margaret, married 1894 in Scotland
- Children: James (explicit surname), Eileen, James, Margaret (all inherit "McGinty")
- Margaret has nickname "Peggy"

### Example 2: Remarriage & Status

```treedown
James McGinty & Fran Adams (M- 1945, VA)
	John Daniel (1993 – stillborn)
Fran Adams & Jack Snodgrass (M- 1976)
```

**Parsed**:

- Two unions at same depth (siblings)
- Fran appears in both unions (remarriage)
- John Daniel marked stillborn

### Example 3: Mixed Separators (needs normalization)

```treedown
Maureen - Dennis Murray (M- 1991, FL)
	Kelly (b. 1994, FL)
```

**Auto-fixed**:

```treedown
Maureen & Dennis Murray (M- 1991, FL)
	Kelly (b. 1994, FL)
```

### Example 4: Unknown Dates

```treedown
William McGinty & Catherine (M-?)
	Thomas (b.?)
	Sarah (1850–)
```

**Parsed**:

- Marriage date unknown (stored as `null`)
- Thomas birth unknown
- Sarah still living or death unknown (open-ended range)

---

## Future Extensions

TreeDown v0.1 is intentionally minimal. Future versions may add:

### Planned Extensions

1. **Additional events**:
   - `(Adopt- <date>)` — Adoption
   - `(Imm- <date>, <place>)` — Immigration
   - `(Bur- <date>, <place>)` — Burial
   - `(Bapt- <date>, <place>)` — Baptism

2. **Relationship types**:
   - `(Partner)` — Non-marriage partnership
   - `(Engaged- <date>)` — Engagement

3. **Extended metadata**:
   - `(Occ- <occupation>)` — Occupation
   - `(Res- <place>)` — Residence
   - `(Src- <citation>)` — Source citation

4. **Export formats**:
   - GEDCOM export for genealogy software compatibility
   - LaTeX genealogy tree export

### Compatibility Promise

- New versions will never change existing token meanings
- Unknown markers will be preserved in `notes.raw`
- Parsers should gracefully handle unrecognized syntax

---

## Implementation

TreeDown is implemented in the [Family Tree Editor](https://github.com/jbrannigan/family-tree-editor), a React-based web application that provides:

- **Live preview**: Edit in TreeDown, see visual tree instantly
- **Multiple export formats**: HTML, JSON, SVG, TXT
- **Focus mode**: Isolate and export specific branches
- **Accessibility**: Full keyboard navigation and screen reader support

See [README.md](README.md) for usage and examples.

---

## License

TreeDown specification: Public domain (CC0)
Family Tree Editor implementation: MIT License

---

## Credits

**TreeDown invented by**: Larry McGinty
**Specification & implementation**: Jim Brannigan and contributors
**Inspiration**: The need to preserve family tree data in a universal, archival-friendly format

---

**Version**: 0.1
**Last updated**: 2025-09-30
**Maintained at**: https://github.com/jbrannigan/family-tree-editor
