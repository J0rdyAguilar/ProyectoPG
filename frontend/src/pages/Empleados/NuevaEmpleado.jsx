import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/api/axios";
import { UserPlus, Save, ArrowLeft } from "lucide-react";

export default function NuevaEmpleado() {
  const nav = useNavigate();

  const [deps, setDeps] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [posiblesJefes, setPosiblesJefes] = useState([]);

  const [f, setF] = useState({
    nombre: "",
    apellido: "",
    numero_identificacion: "",
    fecha_nacimiento: "",
    numero_celular: "",
    direccion: "",
    genero: "",
    renglon_presupuestario: "",
    salario: "",
    dependencia_id: "",
    puesto_id: "",
    id_jefe: "",
    usuario: { nombre: "", usuario: "", contrasena: "", rol_id: "" },
  });

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // ---- helper: cargar puestos por dependencia ----
  const loadPuestosByDep = async (depId) => {
    if (!depId) {
      setPuestos([]);
      return;
    }
    try {
      const r = await api.get("/puestos", { params: { dependencia_id: depId } });
      if (Array.isArray(r.data)) {
        setPuestos(r.data);
        return;
      }
    } catch {
      // fallback
    }
    try {
      const rAll = await api.get("/puestos");
      const only = (rAll.data || []).filter(
        (p) =>
          String(p.dependencia_id) === String(depId) ||
          String(p?.dependencia?.id) === String(depId)
      );
      setPuestos(only);
    } catch {
      setPuestos([]);
    }
  };

  // Carga catálogos base
  useEffect(() => {
    setBusy(true);
    Promise.all([
      api.get("/dependencias"),
      api.get("/roles"),
      api.get("/posibles-jefes"),
    ])
      .then(([d, r, j]) => {
        setDeps(d.data || []);
        setRoles(r.data || []);
        setPosiblesJefes(j.data || []);
      })
      .catch(() => setErr("No se pudieron cargar los catálogos."))
      .finally(() => setBusy(false));
  }, []);

  // Cuando cambia la dependencia, limpio puesto y recargo puestos ligados
  useEffect(() => {
    setF((s) => ({ ...s, puesto_id: "" }));
    if (f.dependencia_id) loadPuestosByDep(f.dependencia_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.dependencia_id]);

  const on = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const onU = (k, v) => setF((s) => ({ ...s, usuario: { ...s.usuario, [k]: v } }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      setLoading(true);
      await api.post("/empleados", { ...f, USUARIO_INGRESO: 1 });
      setOk("Empleado creado con éxito");
      setTimeout(() => nav("/empleados", { replace: true }), 700);
    } catch (e2) {
      setErr(
        e2?.response?.data?.message ||
          e2?.response?.data?.error ||
          "Error al crear empleado"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl2 bg-primary text-white grid place-items-center">
            <UserPlus size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Registrar nuevo empleado</h1>
            <p className="text-ink-muted text-sm">
              Completa los datos del colaborador y su usuario de acceso.
            </p>
          </div>
        </div>

        <Link to="/empleados" className="btn-ghost inline-flex h-10 items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>

      {/* Alerts */}
      {err && <div className="card p-3 border-red-200 bg-red-50 text-red-700">{err}</div>}
      {ok && <div className="card p-3 border-emerald-200 bg-emerald-50 text-emerald-700">{ok}</div>}

      {/* Form card */}
      <form onSubmit={submit} className="card p-6 space-y-6">
        {/* Datos del empleado */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Datos del empleado</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre">
              <Input disabled={loading} value={f.nombre} onChange={(e) => on("nombre", e.target.value)} />
            </Field>

            <Field label="Apellido">
              <Input disabled={loading} value={f.apellido} onChange={(e) => on("apellido", e.target.value)} />
            </Field>

            <Field label="Identificación / DPI">
              <Input disabled={loading} value={f.numero_identificacion} onChange={(e) => on("numero_identificacion", e.target.value)} />
            </Field>

            <Field label="Fecha de nacimiento">
              <Input type="date" disabled={loading} value={f.fecha_nacimiento} onChange={(e) => on("fecha_nacimiento", e.target.value)} />
            </Field>

            <Field label="Celular">
              <Input disabled={loading} value={f.numero_celular} onChange={(e) => on("numero_celular", e.target.value)} />
            </Field>

            <Field label="Dirección" className="md:col-span-2">
              <Textarea disabled={loading} value={f.direccion} onChange={(e) => on("direccion", e.target.value)} rows={2} />
            </Field>

            {/* Género */}
            <Field label="Género">
              <Select
                disabled={loading}
                value={f.genero}
                onChange={(e) => on("genero", e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </Select>
            </Field>

            {/* Renglón presupuestario */}
            <Field label="Renglón presupuestario">
              <Input
                disabled={loading}
                value={f.renglon_presupuestario}
                onChange={(e) => on("renglon_presupuestario", e.target.value)}
                placeholder="Ej. 011"
              />
            </Field>

            {/* Salario */}
            <Field label="Salario (Q)">
              <Input
                type="number"
                min="0"
                step="0.01"
                disabled={loading}
                value={f.salario}
                onChange={(e) => on("salario", e.target.value)}
                placeholder="Ej. 3500.00"
              />
            </Field>

            {/* Dependencia */}
            <Field label="Dependencia">
              <Select
                disabled={busy || loading}
                value={f.dependencia_id}
                onChange={(e) => on("dependencia_id", e.target.value)}
              >
                <option value="">Selecciona una dependencia</option>
                {deps.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </Select>
            </Field>

            {/* Puesto */}
            <Field label="Puesto">
              <Select
                disabled={busy || loading || !f.dependencia_id}
                value={f.puesto_id}
                onChange={(e) => on("puesto_id", e.target.value)}
              >
                <option value="">
                  {!f.dependencia_id
                    ? "Selecciona una dependencia primero"
                    : puestos.length
                      ? "Selecciona un puesto"
                      : "No hay puestos para esta dependencia"}
                </option>
                {puestos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </Select>
            </Field>

            <Field label="Jefe inmediato" className="md:col-span-2">
              <Select
                disabled={busy || loading}
                value={f.id_jefe}
                onChange={(e) => on("id_jefe", e.target.value)}
              >
                <option value="">Sin jefe asignado</option>
                {posiblesJefes.map((jefe) => (
                  <option key={jefe.id} value={jefe.id}>
                    {jefe.nombre_completo}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <hr className="border-soft" />

        {/* Datos del usuario */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Datos del usuario</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre (persona)">
              <Input
                disabled={loading}
                value={f.usuario.nombre}
                onChange={(e) => onU("nombre", e.target.value)}
              />
            </Field>

            <Field label="Usuario (login)">
              <Input
                disabled={loading}
                value={f.usuario.usuario}
                onChange={(e) => onU("usuario", e.target.value)}
              />
            </Field>

            <Field label="Contraseña">
              <Input
                type="password"
                disabled={loading}
                value={f.usuario.contrasena}
                onChange={(e) => onU("contrasena", e.target.value)}
              />
            </Field>

            <Field label="Rol">
              <Select
                disabled={busy || loading}
                value={f.usuario.rol_id}
                onChange={(e) => onU("rol_id", e.target.value)}
              >
                <option value="">Selecciona un rol</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2 h-11">
            <Save size={18} />
            {loading ? "Guardando..." : "Guardar"}
          </button>

          <Link to="/empleados" className="btn-ghost h-11 inline-flex items-center gap-2">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ---------- pequeños helpers de UI ---------- */

function Field({ label, className = "", children }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function Input({ className = "", ...props }) {
  return <input {...props} className={`input ${className}`} />;
}

function Textarea({ className = "", ...props }) {
  return <textarea {...props} className={`textarea ${className}`} />;
}

function Select({ className = "", ...props }) {
  return <select {...props} className={`select ${className}`} />;
}
