// LovIA! — Narrative Engine
// Converts cold clinical scores (0-100) into empathetic, literary insights based on Juan Pablo Peña García's methodology.

export type NarrativeStage = {
    title: string;
    description: string;
    color: string;
}

export function getAmorNarrative(score: number): NarrativeStage {
    if (score < 40) return { 
        title: "Etapa de Cautela", 
        description: "Estás protegiendo tu espacio emocional. Necesitas seguridad e intimidad gradual antes de abrirte por completo.", 
        color: "var(--warning)" 
    }
    if (score < 70) return { 
        title: "Apertura Gradual", 
        description: "Sientes disposición a conectar con un otro, pero evalúas cuidadosamente el ritmo para proteger tu estabilidad.", 
        color: "var(--info)" 
    }
    return { 
        title: "Vinculación Segura", 
        description: "Posees una base emocional sólida y una gran disposición a construir intimidad profunda y recíproca.", 
        color: "var(--success)" 
    }
}

export function getSexualNarrative(score: number): NarrativeStage {
    if (score < 40) return { 
        title: "Espacio de Pausa", 
        description: "En este momento, la prioridad no es la intensidad erótica, sino construir confianza y conexión emocional primero.", 
        color: "var(--text-secondary)" 
    }
    if (score < 70) return { 
        title: "Exploración Sensible", 
        description: "Buscas una química auténtica donde la pasión fluya orgánicamente después de haber establecido un vínculo afectivo.", 
        color: "var(--info)" 
    }
    return { 
        title: "Deseo Activo", 
        description: "Tu energía vital y erótica están en un punto óptimo. Sientes gran libertad para explorar e invitar la pasión a tu vida.", 
        color: "var(--success)" 
    }
}

export function getRealizacionNarrative(score: number): NarrativeStage {
    if (score < 40) return { 
        title: "Reestructuración", 
        description: "Atraviesas una fase de muchos cambios. Administras demasiadas cargas y necesitas enfocar tu energía en ti mismo/a.", 
        color: "var(--warning)" 
    }
    if (score < 70) return { 
        title: "Construcción Activa", 
        description: "Tus metas y proyectos personales están en marcha. Tienes espacio en tu agenda y en tu mente para integrar afecto.", 
        color: "var(--info)" 
    }
    return { 
        title: "Momentum de Vida", 
        description: "Gozas de gran claridad y estabilidad en tu vida. Estás en la posición ideal para compartir tu éxito con una pareja.", 
        color: "var(--success)" 
    }
}

export function getOverallReadinessNarrative(score: number): string {
    if (score < 50) return "Tu mapa indica que este es un tiempo para ti. Conviene sanar y ordenar tu vida antes de invertir energía en alguien más."
    if (score < 75) return "Tienes un ecosistema emocional balanceado. Estás listo/a para conocer a alguien, siempre respetando tu propio ritmo."
    return "Estás en un momento relacional óptimo, con alta madurez afectiva para sostener un vínculo estable y significativo."
}
