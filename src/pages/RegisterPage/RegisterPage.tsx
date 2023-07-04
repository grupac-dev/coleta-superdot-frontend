import * as Form from "@radix-ui/react-form";
import * as Checkbox from "@radix-ui/react-checkbox";
import states from "../../assets/states.json";
import { CheckIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { RegisterValues, registerSchema } from "../../schemas/registerSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputField } from "../../components/Outer/InputField/InputField";
import { SelectField } from "../../components/Outer/SelectField/SelectField";
import { registerResearcher } from "../../api/auth.api";
import { saveTokens } from "../../utils/tokensHandler";
import { redirect, useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({ resolver: yupResolver(registerSchema) });
    const navigate = useNavigate();

    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData();

        for (const key in data) {
            if (key === "personal_data") {
                for (const nestedKey in data[key]) {
                    formData.append(
                        `personal_data[${nestedKey}]`,
                        data["personal_data"][nestedKey as keyof (typeof data)["personal_data"]] as string
                    );
                }
            } else {
                formData.append(key, data[key as keyof RegisterValues] as string);
            }
        }

        if (data.personal_data.profile_photo) {
            formData.set("personal_data[profile_photo]", data.personal_data.profile_photo);
        }

        formData.set("personal_data[birth_date]", data.personal_data.birth_date.toISOString());

        try {
            const result = await registerResearcher(formData);
            if (result.data) {
                saveTokens(result.data);
                navigate("/app/home");
            }
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    });

    return (
        <>
            <header className="p-6 text-4xl">Criar uma conta</header>
            <h3>Seus dados</h3>
            <Form.Root onSubmit={onSubmit} className="mx-auto w-9/12">
                <div className="-mx-3 mb-6 mt-11 grid grid-cols-1 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
                    <InputField
                        placeholder="FOTO DE PERFIL"
                        error={!!errors.personal_data?.profile_photo}
                        errorMessage={errors.personal_data?.profile_photo?.message?.toString()}
                        type="file"
                        className="file:h-[35px] file:border-none file:bg-transparent file:text-black"
                        {...register("personal_data.profile_photo")}
                    ></InputField>

                    <InputField
                        placeholder="NOME COMPLETO*"
                        error={!!errors.personal_data?.full_name}
                        errorMessage={errors.personal_data?.full_name?.message}
                        type="text"
                        {...register("personal_data.full_name")}
                    ></InputField>

                    <InputField
                        placeholder="DATA DE NASCIMENTO*"
                        error={!!errors.personal_data?.birth_date}
                        errorMessage={errors.personal_data?.birth_date?.message}
                        type="date"
                        {...register("personal_data.birth_date")}
                    ></InputField>

                    <InputField
                        placeholder="EMAIL (a ser público)*"
                        error={!!errors.email}
                        errorMessage={errors.email?.message}
                        type="email"
                        {...register("email")}
                    ></InputField>

                    <InputField
                        placeholder="CONFIRMAR EMAIL*"
                        error={!!errors.confirm_email}
                        errorMessage={errors.confirm_email?.message}
                        type="email"
                        {...register("confirm_email")}
                    ></InputField>

                    <InputField
                        placeholder="INSTITUIÇÃO DE TRABALHO*"
                        error={!!errors.instituition}
                        errorMessage={errors.instituition?.message}
                        type="text"
                        {...register("instituition")}
                    ></InputField>

                    <SelectField
                        placeholder="ESTADO*"
                        error={!!errors.personal_data?.country_state}
                        errorMessage={errors.personal_data?.country_state?.message}
                        {...register("personal_data.country_state")}
                    >
                        {states.map((state) => (
                            <option key={state.acronym} value={state.acronym}>
                                {state.name}
                            </option>
                        ))}
                    </SelectField>

                    <InputField
                        placeholder="TELEFONE*"
                        error={!!errors.personal_data?.phone}
                        errorMessage={errors.personal_data?.phone?.message}
                        type="text"
                        maxLength={11}
                        {...register("personal_data.phone")}
                    ></InputField>

                    <InputField
                        placeholder="SENHA*"
                        error={!!errors.password}
                        errorMessage={errors.password?.message}
                        type="password"
                        {...register("password")}
                    ></InputField>

                    <InputField
                        placeholder="CONFIRMAR SENHA*"
                        error={!!errors.password_confirmation}
                        errorMessage={errors.password_confirmation?.message}
                        type="password"
                        {...register("password_confirmation")}
                    ></InputField>
                </div>

                <div className="flex items-center">
                    <Checkbox.Root
                        id="acceptLicense"
                        name="accept_license"
                        className="flex h-[20px] min-w-[20px] rounded-[4px] bg-white shadow-[0_2px_10px] shadow-blackA7 hover:bg-violet3 focus:shadow-[0_0_0_2px_black]"
                    >
                        <Checkbox.Indicator className=" text-violet11">
                            <CheckIcon className="h-[20px] w-[20px]" />
                        </Checkbox.Indicator>
                    </Checkbox.Root>
                    <label htmlFor="acceptLicense" className="pl-[15px] text-left text-[15px] leading-6 text-white ">
                        <p>
                            Estou ciente de que todos os <b>dados de pesquisa</b> que forem cadastrados na plataforma
                            estarão disponibilizados publicamente
                        </p>
                    </label>
                </div>

                <Form.Submit asChild className="mt-10">
                    <button className="mt-[10px] box-border inline-flex h-[35px]  items-center justify-center rounded-[4px] bg-violet-800 px-[15px] font-medium leading-none text-white shadow-[0_2px_10px] shadow-blackA7 hover:bg-violet-600 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
                        Continuar
                    </button>
                </Form.Submit>
                <div className="mb-5 mt-10">
                    <div className=" text-red-600 ">* Campos obrigatórios</div>
                    <div className="mt-5 text-xs">
                        <a href="#">Já tenho uma conta...</a>
                    </div>
                </div>
            </Form.Root>
        </>
    );
};

export default RegisterPage;