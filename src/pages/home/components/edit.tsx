import { Button, Input, Textarea } from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { supabase } from "~/server/config";

export const Edit = ({ id, title, description }: { id: number; title: string; description: string }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      title,
      description,
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (form: { title: string; description: string }) => {
      const { error } = await supabase.from("yahooList").update(form).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["yahooList"] });
    },
  });

  return (
    <form className="flex flex-col gap-2" onSubmit={form.handleSubmit((form) => mutate(form))}>
      <Input {...form.register("title")} />
      <Textarea {...form.register("description")} />
      <Button type="submit" color="primary">
        수정
      </Button>
    </form>
  );
};
