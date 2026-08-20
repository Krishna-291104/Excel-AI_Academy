INSERT INTO courses (slug,title,description,level)
VALUES
('excel-core','Excel Core Skills','From spreadsheet fundamentals to advanced analysis.','beginner'),
('ai-excel','AI in Excel','Use AI-assisted workflows safely and effectively inside spreadsheet work.','intermediate'),
('data-analysis','Data Analyst Roadmap','Progress from Excel through SQL, BI, Python and portfolio projects.','advanced')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO modules (course_id,slug,title,order_index)
SELECT id,'excel-starter','Excel Starter',1 FROM courses WHERE slug='excel-core'
ON CONFLICT DO NOTHING;
INSERT INTO modules (course_id,slug,title,order_index)
SELECT id,'excel-intermediate','Excel Intermediate',2 FROM courses WHERE slug='excel-core'
ON CONFLICT DO NOTHING;
INSERT INTO modules (course_id,slug,title,order_index)
SELECT id,'excel-advanced','Excel Advanced',3 FROM courses WHERE slug='excel-core'
ON CONFLICT DO NOTHING;

INSERT INTO modules (course_id,slug,title,order_index)
SELECT id,'ai-foundations','AI in Excel',1 FROM courses WHERE slug='ai-excel'
ON CONFLICT DO NOTHING;

INSERT INTO modules (course_id,slug,title,order_index)
SELECT id,'analyst-foundations','Analyst Foundations',1 FROM courses WHERE slug='data-analysis'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (module_id,slug,title,level,duration_minutes,content,objectives,order_index)
SELECT m.id,'excel-interface','Excel Interface & Workbook Basics','beginner',20,
'["Understand workbooks, worksheets, rows, columns and cell references.","Navigate the Excel interface efficiently."]',
'["Navigate Excel confidently","Understand workbook structure"]',1
FROM modules m WHERE m.slug='excel-starter'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (module_id,slug,title,level,duration_minutes,content,objectives,order_index)
SELECT m.id,'formulas','Formula Foundations','beginner',25,
'["Understand formulas, operators and cell references.","Build simple calculations and verify results."]',
'["Write basic formulas","Use references correctly"]',2
FROM modules m WHERE m.slug='excel-starter'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (module_id,slug,title,level,duration_minutes,content,objectives,order_index)
SELECT m.id,'xlookup','XLOOKUP','intermediate',25,
'["Understand lookup logic.","Use XLOOKUP to return matching values."]',
'["Build XLOOKUP formulas","Handle missing matches"]',1
FROM modules m WHERE m.slug='excel-intermediate'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (module_id,slug,title,level,duration_minutes,content,objectives,order_index)
SELECT m.id,'pivot-tables','Pivot Tables','intermediate',30,
'["Summarize large datasets.","Group, filter and compare measures."]',
'["Create pivot tables","Summarize business data"]',2
FROM modules m WHERE m.slug='excel-intermediate'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (module_id,slug,title,level,duration_minutes,content,objectives,order_index)
SELECT m.id,'power-query','Power Query','advanced',35,
'["Build repeatable data transformation workflows.","Apply cleaning and shaping steps."]',
'["Transform data","Create repeatable workflows"]',1
FROM modules m WHERE m.slug='excel-advanced'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (module_id,slug,title,level,duration_minutes,content,objectives,order_index)
SELECT m.id,'ai-prompting','Prompting for Spreadsheet Tasks','intermediate',25,
'["Write precise spreadsheet prompts.","Specify inputs, constraints and expected outputs."]',
'["Create reliable prompts","Review AI output"]',1
FROM modules m WHERE m.slug='ai-foundations'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (module_id,slug,title,level,duration_minutes,content,objectives,order_index)
SELECT m.id,'sql-foundations','SQL Foundations','intermediate',40,
'["Understand SELECT, WHERE, GROUP BY and JOIN concepts."]',
'["Read SQL queries","Build simple analytical queries"]',1
FROM modules m WHERE m.slug='analyst-foundations'
ON CONFLICT DO NOTHING;

INSERT INTO datasets (slug,title,level,description,rows_count,skills)
VALUES
('retail-sales','Retail Sales — Beginner','beginner','Retail transaction data for formula and chart practice.',120,'["SUMIFS","XLOOKUP","Charts"]'),
('ecommerce','E-commerce Orders — Intermediate','intermediate','Order-level data for cleaning and pivot analysis.',1500,'["Cleaning","Pivot Tables","Analysis"]'),
('marketing','Marketing Campaigns — Advanced','advanced','Campaign performance data for ROI and segmentation.',5000,'["Segmentation","ROI","Visualization"]'),
('finance','Finance Reconciliation — Expert','expert','Reconciliation practice with exceptions and controls.',12000,'["Reconciliation","Exceptions","Controls"]')
ON CONFLICT (slug) DO NOTHING;
