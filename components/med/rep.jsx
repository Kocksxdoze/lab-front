"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Box, Input, Button, useToast, Select, Flex } from "@chakra-ui/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { getApiBaseUrl } from "../../utils/api";
function ReportCreatePage() {
  const { id } = useParams(); // ID категории отчёта
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState("");

  const [borderColor, setBorderColor] = useState("#999999");
  const [borderWidth, setBorderWidth] = useState("1");
  const api = getApiBaseUrl();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "",
  });

  if (!editor) return null;

  const updateCellBorderStyle = (color, width) => {
    const attrs = editor.getAttributes("tableCell") || {};
    let style = attrs.style || "";

    style = style.replace(/border(-[a-z]+)?:\s*[^;]+;?/g, "").trim();

    const borderStyle = `border: ${width}px solid ${color};`;

    const newStyle = `${style} ${borderStyle}`.trim();

    editor
      .chain()
      .focus()
      .updateAttributes("tableCell", { style: newStyle })
      .run();
  };

  const onBorderColorChange = (e) => {
    const color = e.target.value;
    setBorderColor(color);
    updateCellBorderStyle(color, borderWidth);
  };

  const onBorderWidthChange = (e) => {
    const width = e.target.value;
    setBorderWidth(width);
    updateCellBorderStyle(borderColor, width);
  };

  const setFontFamily = (family) => {
    editor.chain().focus().setFontFamily(family).run();
  };

  const handleSubmit = async () => {
    if (!name || !editor || editor.isEmpty) {
      toast({
        title: "Поля не могут быть пустыми",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(`${api}/rep/new`, {
        title: name,
        desc: editor.getHTML(),
        reportId: id,
      });

      toast({
        title: "Отчёт создан",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      router.push("/reports");
    } catch (error) {
      console.error(error);
      toast({
        title: "Ошибка создания",
        description: error.response?.data?.message || "Попробуйте позже",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} bg="#fff" w="100%" borderRadius="16px">
      <Input
        placeholder="Название отчёта"
        mb={4}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Тулбар */}
      <Flex mb={2} gap={2} flexWrap="wrap" alignItems="center">
        <Button
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive("bold") ? "solid" : "outline"}
          title="Жирный"
        >
          B
        </Button>
        <Button
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive("italic") ? "solid" : "outline"}
          title="Курсив"
        >
          I
        </Button>
        <Button
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          variant={editor.isActive("underline") ? "solid" : "outline"}
          title="Подчёркнутый"
        >
          U
        </Button>

        <Select
          size="sm"
          width="auto"
          placeholder="Шрифт"
          onChange={(e) => setFontFamily(e.target.value)}
          value={editor.getAttributes("textStyle").fontFamily || ""}
          title="Семейство шрифтов"
        >
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="'Georgia', serif">Georgia</option>
          <option value="'Verdana', sans-serif">Verdana</option>
        </Select>

        <Button
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive("bulletList") ? "solid" : "outline"}
          title="Маркированный список"
        >
          • Список
        </Button>
        <Button
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive("orderedList") ? "solid" : "outline"}
          title="Нумерованный список"
        >
          1. Список
        </Button>
        <Button
          size="sm"
          onClick={() => editor.chain().focus().setParagraph().run()}
          variant={editor.isActive("paragraph") ? "solid" : "outline"}
          title="Абзац"
        >
          Абзац
        </Button>
        <Button
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          variant={editor.isActive("codeBlock") ? "solid" : "outline"}
          title="Код"
        >
          Код
        </Button>

        {/* Таблица */}
        <Button
          size="sm"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Вставить таблицу"
        >
          Вставить таблицу
        </Button>

        {/* Управление колонками */}
        <Button
          size="sm"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editor.can().addColumnBefore()}
          title="Добавить колонку слева"
        >
          Добавить колонку слева
        </Button>
        <Button
          size="sm"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
          title="Добавить колонку справа"
        >
          Добавить колонку справа
        </Button>
        <Button
          size="sm"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.can().deleteColumn()}
          colorScheme="red"
          title="Удалить колонку"
        >
          Удалить колонку
        </Button>

        {/* Управление строками */}
        <Button
          size="sm"
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editor.can().addRowBefore()}
          title="Добавить строку сверху"
        >
          Добавить строку сверху
        </Button>
        <Button
          size="sm"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
          title="Добавить строку снизу"
        >
          Добавить строку снизу
        </Button>
        <Button
          size="sm"
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.can().deleteRow()}
          colorScheme="red"
          title="Удалить строку"
        >
          Удалить строку
        </Button>

        {/* Удалить всю таблицу */}
        <Button
          size="sm"
          colorScheme="red"
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
          title="Удалить всю таблицу"
        >
          Удалить таблицу
        </Button>

        {/* Управление границами */}
        <Input
          type="color"
          size="sm"
          width="40px"
          height="30px"
          value={borderColor}
          onChange={onBorderColorChange}
          title="Цвет границы ячейки"
        />

        <Select
          size="sm"
          width="60px"
          value={borderWidth}
          onChange={onBorderWidthChange}
          title="Толщина границы ячейки (px)"
        >
          <option value="1">1 px</option>
          <option value="2">2 px</option>
          <option value="3">3 px</option>
          <option value="4">4 px</option>
          <option value="5">5 px</option>
        </Select>
      </Flex>

      {/* Редактор */}
      <Box
        border="1px solid #ccc"
        borderRadius="md"
        p={2}
        minH="300px"
        onClick={() => editor.chain().focus().run()}
        cursor="text"
        overflow="auto"
      >
        <EditorContent editor={editor} />
      </Box>

      <Button mt={4} colorScheme="blue" onClick={handleSubmit}>
        Сохранить
      </Button>

      {/* Стили для таблиц и списков */}
      <style jsx global>{`
        .ProseMirror {
          max-width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #999;
          padding: 8px;
          text-align: left;
        }
        .ProseMirror th {
          background-color: #eee;
        }
        .ProseMirror td:hover,
        .ProseMirror th:hover {
          background-color: #f9f9f9;
        }

        /* Фикс выхода маркеров списка за пределы */
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.2em; /* стандартный отступ */
          margin-left: 0;
          overflow: hidden;
          max-width: 100%;
          box-sizing: border-box;
        }

        .ProseMirror ul li,
        .ProseMirror ol li {
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
      `}</style>
    </Box>
  );
}

export default ReportCreatePage;
