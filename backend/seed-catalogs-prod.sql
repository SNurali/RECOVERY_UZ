-- ============================================================
-- RECOVERY.UZ — Заполнение справочников (equipments, issues, services)
-- ИДЕМПОТЕНТНЫЙ: безопасно запускать повторно
--
-- Для боевого сервера (БД: hdd_fixer_db, юзер: hdd_fixer):
--   sudo docker exec -i recovery_postgres \
--     psql -U hdd_fixer -d hdd_fixer_db < backend/seed-catalogs-prod.sql
-- ============================================================

BEGIN;

-- ===================== EQUIPMENTS (Оборудование) =====================

INSERT INTO equipments (name_rus, name_cyr, name_lat, name_eng)
SELECT v.name_rus, v.name_cyr, v.name_lat, v.name_eng
FROM (VALUES
  ('Жёсткий диск HDD 3.5"',        'Қаттиқ диск HDD 3.5"',         'Qattiq disk HDD 3.5"',          'Hard Drive HDD 3.5"'),
  ('Жёсткий диск HDD 2.5"',        'Қаттиқ диск HDD 2.5"',         'Qattiq disk HDD 2.5"',          'Hard Drive HDD 2.5"'),
  ('Твердотельный накопитель SSD',  'SSD тезкор хотира',             'SSD tezkor xotira',              'Solid State Drive SSD'),
  ('NVMe / M.2 SSD',               'NVMe / M.2 SSD',                'NVMe / M.2 SSD',                 'NVMe / M.2 SSD'),
  ('Внешний жёсткий диск',         'Ташқи қаттиқ диск',             'Tashqi qattiq disk',             'External Hard Drive'),
  ('USB флеш-накопитель',          'USB флеш-хотира',               'USB flesh-xotira',                'USB Flash Drive'),
  ('Карта памяти SD / microSD',    'SD / microSD хотира картаси',   'SD / microSD xotira kartasi',     'Memory Card SD / microSD'),
  ('RAID массив',                  'RAID массиви',                   'RAID massivi',                    'RAID Array'),
  ('NAS-сервер',                   'NAS-сервер',                     'NAS-server',                      'NAS Server'),
  ('Ноутбук',                      'Ноутбук',                        'Noutbuk',                         'Laptop'),
  ('Настольный ПК',               'Стол компьютери',                'Stol kompyuteri',                 'Desktop PC'),
  ('Видеорегистратор (DVR/NVR)',   'Видеорегистратор (DVR/NVR)',     'Videoregistrator (DVR/NVR)',       'Video Recorder (DVR/NVR)'),
  ('Карта памяти CompactFlash',    'CompactFlash хотира картаси',   'CompactFlash xotira kartasi',     'CompactFlash Memory Card'),
  ('Телефон / Планшет',           'Телефон / Планшет',              'Telefon / Planshet',              'Phone / Tablet')
) AS v(name_rus, name_cyr, name_lat, name_eng)
WHERE NOT EXISTS (
  SELECT 1 FROM equipments e WHERE e.name_rus = v.name_rus
);

-- ===================== ISSUES (Неисправности) =====================

INSERT INTO issues (name_rus, name_cyr, name_lat, name_eng)
SELECT v.name_rus, v.name_cyr, v.name_lat, v.name_eng
FROM (VALUES
  ('Не определяется в BIOS / системе',       'BIOS / тизимда аниқланмайди',          'BIOS / tizimda aniqlanmaydi',          'Not detected in BIOS / system'),
  ('Стук / щелчки внутри гермоблока',        'Гермоблок ичида тақиллаш / шиқирлаш',  'Germoblok ichida taqillash / shiqirlash','Clicking / knocking inside HDA'),
  ('Случайное удаление файлов',              'Файлларнинг тасодифий ўчирилиши',       'Fayllarning tasodifiy o''chirilishi',    'Accidental file deletion'),
  ('Форматирование диска',                   'Дискни форматлаш',                      'Diskni formatlash',                     'Disk formatting'),
  ('Логические ошибки файловой системы',     'Файл тизими мантиқий хатолари',         'Fayl tizimi mantiqiy xatolari',         'File system logical errors'),
  ('Повреждение электроники (PCB)',          'Электроника шикасти (PCB)',              'Elektronika shikasti (PCB)',             'PCB electronics damage'),
  ('Диск запилен (царапины на пластинах)',   'Диск тирналган (пластиналарда тирнаш)', 'Disk tirnalgan (plastinalarda tirnash)', 'Platter scratches (scored disk)'),
  ('Заклинил шпиндельный двигатель',        'Шпиндел двигатели тўхтаган',             'Shpindel dvigateli to''xtagan',          'Seized spindle motor'),
  ('Битые секторы (Bad Sectors)',            'Бузилган секторлар (Bad Sectors)',        'Buzilgan sektorlar (Bad Sectors)',       'Bad Sectors'),
  ('Повреждение прошивки (Firmware)',        'Прошивка шикасти (Firmware)',             'Proshivka shikasti (Firmware)',          'Firmware corruption'),
  ('Попадание воды / жидкости',             'Сувга / суюқликка тушиб қолиш',          'Suvga / suyuqlikka tushib qolish',      'Water / liquid damage'),
  ('Падение / удар',                        'Тушиб кетиш / зарба',                    'Tushib ketish / zarba',                 'Drop / impact damage'),
  ('Перегрев диска',                        'Дискнинг қизиб кетиши',                   'Diskning qizib ketishi',                'Disk overheating'),
  ('Данные зашифрованы / вирус',            'Маълумотлар шифрланган / вирус',          'Ma''lumotlar shifrlangan / virus',       'Data encrypted / virus'),
  ('Диск медленно работает',                'Диск секин ишлаяпти',                     'Disk sekin ishlayapti',                 'Slow disk performance'),
  ('Странные звуки при работе',             'Ишлаганда ғалати товушлар',               'Ishlagan da g''alati tovushlar',         'Strange noises during operation'),
  ('Другая неисправность',                  'Бошқа носозлик',                           'Boshqa nosozlik',                       'Other issue')
) AS v(name_rus, name_cyr, name_lat, name_eng)
WHERE NOT EXISTS (
  SELECT 1 FROM issues i WHERE i.name_rus = v.name_rus
);

-- ===================== SERVICES (Услуги) =====================

INSERT INTO services (name_rus, name_cyr, name_lat, name_eng)
SELECT v.name_rus, v.name_cyr, v.name_lat, v.name_eng
FROM (VALUES
  ('Диагностика носителя',                          'Маълумот ташувчини диагностика қилиш',        'Ma''lumot tashuvchini diagnostika qilish',       'Media diagnostics'),
  ('Восстановление данных с магнитных пластин',     'Магнит пластиналардан маълумотларни тиклаш',   'Magnit plastinalardan ma''lumotlarni tiklash',    'Data recovery from magnetic platters'),
  ('Замена блока магнитных головок (БМГ)',           'Магнит каллаклар блокини алмаштириш (БМГ)',    'Magnit kallaklar blokini almashtirish (BMG)',     'Head stack assembly (HSA) replacement'),
  ('Ремонт / замена платы контроллера (PCB)',       'Контроллер платасини таъмирлаш / алмаштириш', 'Kontroller platasini ta''mirlash / almashtirish', 'PCB repair / replacement'),
  ('Восстановление логического раздела',            'Мантиқий бўлинмани тиклаш',                    'Mantiqiy bo''linmani tiklash',                    'Logical partition recovery'),
  ('Восстановление после форматирования',           'Форматлашдан кейин тиклаш',                    'Formatlashdan keyin tiklash',                     'Recovery after formatting'),
  ('Восстановление данных с SSD / флеш-памяти',    'SSD / флеш-хотирадан маълумот тиклаш',        'SSD / flesh-xotiradan ma''lumot tiklash',         'SSD / flash memory data recovery'),
  ('Восстановление данных с RAID',                  'RAID дан маълумот тиклаш',                     'RAID dan ma''lumot tiklash',                      'RAID data recovery'),
  ('Восстановление после вирусного шифрования',    'Вирусли шифрлашдан кейин тиклаш',             'Virusli shifrlashdan keyin tiklash',              'Recovery after ransomware encryption'),
  ('Ремонт шпиндельного двигателя',                'Шпиндел двигателини таъмирлаш',                'Shpindel dvigatelini ta''mirlash',                'Spindle motor repair'),
  ('Клонирование / копирование диска',             'Дискни клонлаш / нусхалаш',                    'Diskni klonlash / nusxalash',                     'Disk cloning / copying'),
  ('Ремонт прошивки (Firmware)',                    'Прошивкани таъмирлаш (Firmware)',               'Proshivkani ta''mirlash (Firmware)',               'Firmware repair'),
  ('Восстановление данных с повреждённых пластин', 'Шикастланган пластиналардан маълумот тиклаш',  'Shikastlangan plastinalardan ma''lumot tiklash',  'Recovery from damaged platters'),
  ('Перенос данных на новый носитель',             'Маълумотларни янги ташувчига кўчириш',          'Ma''lumotlarni yangi tashuvchiga ko''chirish',    'Data transfer to new media')
) AS v(name_rus, name_cyr, name_lat, name_eng)
WHERE NOT EXISTS (
  SELECT 1 FROM services s WHERE s.name_rus = v.name_rus
);

COMMIT;

-- Проверка
SELECT 'equipments' AS "Таблица", count(*) AS "Записей" FROM equipments
UNION ALL
SELECT 'issues', count(*) FROM issues
UNION ALL
SELECT 'services', count(*) FROM services
ORDER BY 1;
