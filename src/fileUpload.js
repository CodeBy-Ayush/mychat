import { supabase } from "./supabase";

export async function uploadFile(file) {
    if (!file) {
        throw new Error("No file selected");
    }

    const fileName =
        `${Date.now()}-${file.name}`;

    const filePath =
        `uploads/${fileName}`;

    const { error } = await supabase.storage
        .from("chat-files")
        .upload(filePath, file);

    if (error) {
        throw error;
    }

    const { data } = supabase.storage
        .from("chat-files")
        .getPublicUrl(filePath);

    return {
        name: file.name,
        size: file.size,
        type: file.type,
        url: data.publicUrl,
    };
}