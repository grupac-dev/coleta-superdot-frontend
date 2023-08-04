import * as Form from "@radix-ui/react-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { InputField } from "../../components/InputField/InputField";
import { PAGE_SIZE } from "../../api/researchers.api";
import { useEffect, useState } from "react";
import ISample, { PageSample, deleteSample, paginateSamples } from "../../api/sample.api";
import { MySamplesFilters, mySamplesFiltersSchema } from "../../schemas/mySample.schema";
import { Card } from "../../components/Card/Card";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import Modal from "../../components/Modal/Modal";
import Notify from "../../components/Notify/Notify";
import { useLocation, useNavigate } from "react-router-dom";
import { stateWithNotification } from "../../validators/navigationStateValidators";

const MySamplesPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(mySamplesFiltersSchema) });
    const navigate = useNavigate();
    const location = useLocation();

    const [pageData, setPageData] = useState<PageSample>();
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<MySamplesFilters>();
    const [sampleSelecteds, setSampleSelecteds] = useState();

    /* STATES TO SHOW NOTIFICATION */
    const [notificationTitle, setNotificationTitle] = useState<string>();
    const [notificationDescription, setNotificationDescription] = useState<string>();

    /* STATES TO DELETE SAMPLE REQUEST*/
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const [sampleIdToDelete, setSampleIdToDelete] = useState<string>();

    useEffect(() => {
        if (stateWithNotification(location.state)) {
            setNotificationTitle(location.state.notification.title);
            setNotificationDescription(location.state.notification.description);
        }
    }, [location.state]);

    useEffect(() => {
        const getPage = async () => {
            const response = await paginateSamples(currentPage, PAGE_SIZE, filters);
            if (response.status === 200) {
                console.log(response);
                setPageData(response.data);
            }
        };

        getPage();
    }, [currentPage, filters]);

    /* HANDLERS TO DELETE SAMPLE REQUEST*/
    const handleOnTrashSampleIconClick = (sampleId: string | undefined) => {
        if (sampleId) {
            setSampleIdToDelete(sampleId);
        }
        setOpenModalDelete(true);
    };

    const handleOnPencilSampleIconClick = (sample: ISample | undefined) => {
        if (sample) {
            navigate("/app/edit-sample", {
                state: {
                    sample,
                },
            });
        }
    };

    const handleDeleteSample = async () => {
        try {
            const response = await deleteSample(sampleIdToDelete);

            if (response.status === 200) {
                const dataFiltered = pageData?.data?.filter((data) => data._id !== sampleIdToDelete);
                const newPageData = {
                    ...pageData,
                    data: dataFiltered ? [...dataFiltered] : undefined,
                };
                setPageData(newPageData);
                setOpenModalDelete(false);
            }
            setNotificationTitle("Solicitação apagada!");
            setNotificationDescription("A solicitação foi apagada com sucesso!");
        } catch (e) {
            setNotificationTitle("Erro ao apagar solicitação");
            setNotificationDescription("Não foi possível apagar a solicitação. Tente novamente mais tarde.");
            console.error(e);
        }
    };

    return (
        <Notify
            open={!!notificationTitle}
            onOpenChange={() => setNotificationTitle("")}
            title={notificationTitle}
            description={notificationDescription}
        >
            <header className="p-6 text-4xl font-bold">Minhas Amostras</header>
            <Form.Root
                onSubmit={handleSubmit((data) => {
                    setFilters({
                        ...data,
                    });
                })}
                className="mx-auto my-8 inline-block w-11/12"
            >
                <div className="sm:flex">
                    <InputField
                        label="Pesquisar pelo título da pesquisa"
                        placeholder="Digite o título da pesquisa"
                        errorMessage={errors.researcherTitle?.message}
                        {...register("researcherTitle")}
                    />
                    <InputField
                        label="Pesquisar pelo título da amostra"
                        placeholder="Digite o título da amostra"
                        errorMessage={errors.sampleTitle?.message}
                        {...register("sampleTitle")}
                    />
                </div>
                <button onClick={() => setFilters({})} type="reset" className="button-neutral-light float-right mr-3">
                    Limpar Campos
                </button>
                <Form.Submit asChild>
                    <button className="button-primary float-right mr-3">Pesquisar</button>
                </Form.Submit>
            </Form.Root>
            <div className="flex justify-center gap-3">
                <button className="button-primary">Avaliar Pessoas das Amostras Selecionadas</button>
                <button className="button-primary">Avaliar Amostras Selecionadas</button>
            </div>
            <div className="mt-10 grid grid-cols-1 content-center justify-items-center gap-x-3 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                {pageData?.data?.map((sample, index) => {
                    return (
                        <Card.Root key={index}>
                            <Card.Header>
                                <div className="flex gap-x-3">
                                    <Pencil1Icon
                                        onClick={() => handleOnPencilSampleIconClick(sample)}
                                        width={20}
                                        height={20}
                                    />
                                    {sample.sampleGroup}
                                    {sample.status !== "Autorizado" && (
                                        <TrashIcon
                                            onClick={() => handleOnTrashSampleIconClick(sample._id)}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Content>
                                <h3></h3>
                                <h3></h3>
                                <ul>
                                    <li>Amostra: {sample.sampleTitle}</li>
                                    <li>Pesquisa: {sample.researchTitle}</li>
                                    <li>Limite de participantes: {sample.qttParticipantsAuthorized}</li>
                                    <li>Participantes cadastrados: X</li>
                                    <li>Código do Comitê de Ética: {sample.researchCep.cepCode}</li>
                                    <li>Data da Solicitação da amostra: {sample.createdAt}</li>
                                    <li>Data da aprovação da solicitação: {sample.approvedAt}</li>
                                </ul>
                            </Card.Content>
                            <Card.Actions>
                                <Card.Action
                                    disabled={
                                        sample.status !== "Autorizado" ||
                                        sample.qttParticipantsAuthorized === sample.qttParticipantsRegistered
                                    }
                                >
                                    Cadastrar Pessoas
                                </Card.Action>
                                <Card.Action
                                    disabled={sample.status !== "Autorizado" || sample.qttParticipantsRegistered > 0}
                                >
                                    Avaliar Pessoas
                                </Card.Action>
                            </Card.Actions>
                        </Card.Root>
                    );
                })}
            </div>
            <Modal
                open={openModalDelete}
                setOpen={setOpenModalDelete}
                title="Apagando solicitação de amostra"
                accessibleDescription="A solicitação de amostra selecionada será apagada."
            >
                <h3>Tem certeza que deseja apagar a solicitação de amostra selecionada?</h3>
                <div className="mt-6 flex justify-center gap-3">
                    <button onClick={handleDeleteSample} className="button-neutral-dark">
                        Sim
                    </button>
                    <button onClick={() => setOpenModalDelete(false)} className="button-primary">
                        Cancelar
                    </button>
                </div>
            </Modal>
        </Notify>
    );
};

export default MySamplesPage;