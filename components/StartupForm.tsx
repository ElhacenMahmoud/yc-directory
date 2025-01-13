"use client";
import { Input } from "./ui/input";
import { useActionState, useState } from "react";
import { Textarea } from "./ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Send } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createPatch } from "@/lib/actions";

const StartupForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleFormSubmit = async (prevState: any, formtData: FormData) => {
    try {
      const formValues = {
        title: formtData.get("title") as string,
        description: formtData.get("description") as string,
        category: formtData.get("category") as string,
        link: formtData.get("link") as string,
        pitch,
      };
      await formSchema.parseAsync(formValues);

      const result = await createPatch(prevState, formtData, pitch);

      if (result.status === "SUCCESS") {
        toast({
          title: "Success",
          description: "Your startup pitch has been created successfully",
        });
        router.push(`/startup/${result._id}`);
      }

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;

        setErrors(fieldErrors as unknown as Record<string, string>);

        toast({
          title: "Error",
          description: "please check your input and try again",
          variant: "destructive",
        });

        return { ...prevState, statut: "ERROR", error: "Invalid form data" };
      }
    }

    toast({
      title: "Error",
      description: "An unexpected error has occurred",
      variant: "destructive",
    });

    return {
      ...prevState,
      error: "An unexpected error has occurred",
      status: "ERROR",
    };
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    statut: "INITIAL",
  });

  return (
    <form action={formAction} className="startup-form">
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
        />

        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_textarea"
          required
          placeholder="Startup Description"
        />

        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>
      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          className="startup-form_input"
          required
          placeholder="Startup Category (Tech, Health, Education, etc.)"
        />

        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>
      <div>
        <label htmlFor="link" className="startup-form_label">
          Image URL
        </label>
        <Input
          id="link"
          name="link"
          className="startup-form_input"
          required
          placeholder="Startup Image URL"
        />

        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>
      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>
        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value as string)}
          preview="edit"
          height={300}
          style={{ borderRadius: "20", overflow: "hidden" }}
          textareaProps={{
            placeholder:
              "Briefly describe your idea and what problem it solves",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />

        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      <button
        type="submit"
        className={`startup-form_btn text-white flex items-center justify-center ${isPending ? "bg-gray-200 opacity-50 cursor-not-allowed" : ""}`}
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Your Pitch"}
        <Send className="size-6 ml-5" />
      </button>
    </form>
  );
};

export default StartupForm;
