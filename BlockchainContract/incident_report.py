# incident_report.py
from pyteal import *

def approval_program():
    ADMIN_KEY = Bytes("admin")  # creator (authority)
    # box name: "inc:" + incident_id

    @Subroutine(TealType.bytes)
    def box_name_for_incident(inc_id: Expr) -> Expr:
        return Concat(Bytes("inc:"), inc_id)

    on_create = Seq(
        App.globalPut(ADMIN_KEY, Txn.sender()),
        Approve()
    )

    # trigger_incident(incident_id, evidence_id, location_hash, optional_meta)
    trigger_incident = Seq(
        Assert(Txn.application_args.length() >= Int(3)),
        inc_id := Txn.application_args[0],
        evidence_id := Txn.application_args[1],
        loc_hash := Txn.application_args[2],
        meta := If(Txn.application_args.length() > Int(3), Txn.application_args[3], Bytes("")),
        bn := box_name_for_incident(inc_id),
        Assert(Not(BoxExists(bn))),
        ts := Itob(Global.latest_timestamp()),
        # default status = "pending"
        value := Concat(Txn.sender(), Bytes("|"), evidence_id, Bytes("|"), loc_hash, Bytes("|"), Bytes("pending"), Bytes("|"), ts, Bytes("|"), meta),
        BoxPut(bn, value),
        Log(Concat(Bytes("IncidentTriggered|"), inc_id, Bytes("|"), Txn.sender(), Bytes("|"), ts)),
        Approve()
    )

    # update_incident_status(incident_id, new_status) -> admin or verified authority only
    update_status = Seq(
        Assert(Txn.application_args.length() == Int(2)),
        inc_id := Txn.application_args[0],
        new_status := Txn.application_args[1],  # "verified", "false", "resolved", etc.
        bn := box_name_for_incident(inc_id),
        Assert(BoxExists(bn)),
        stored := BoxGet(bn),
        parts := Split(stored, Bytes("|")),
        owner := parts[0],
        evidence_id := parts[1],
        loc_hash := parts[2],
        meta := If(Len(parts) > Int(5), parts[5], Bytes("")),
        ts := Itob(Global.latest_timestamp()),
        new_val := Concat(owner, Bytes("|"), evidence_id, Bytes("|"), loc_hash, Bytes("|"), new_status, Bytes("|"), ts, Bytes("|"), meta),
        # permission check: only ADMIN (contract creator) or a verified guardian/authority allowed.
        # For simplicity: allow admin or if sender is the same as owner (user can update too)
        Assert(Or(Txn.sender() == App.globalGet(ADMIN_KEY), Txn.sender() == owner)),
        BoxPut(bn, new_val),
        Log(Concat(Bytes("IncidentUpdated|"), inc_id, Bytes("|"), new_status, Bytes("|"), ts)),
        Approve()
    )

    # read_incident(incident_id)
    read_incident = Seq(
        Assert(Txn.application_args.length() == Int(1)),
        inc_id := Txn.application_args[0],
        bn := box_name_for_incident(inc_id),
        Assert(BoxExists(bn)),
        Log(Concat(Bytes("IncidentRead|"), inc_id, Bytes("|"), BoxGet(bn))),
        Approve()
    )

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == App.globalGet(ADMIN_KEY))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == App.globalGet(ADMIN_KEY))],
        [Txn.on_completion() == OnComplete.NoOp, Cond(
            [Txn.application_args[0] == Bytes("trigger_incident"), trigger_incident],
            [Txn.application_args[0] == Bytes("update_incident_status"), update_status],
            [Txn.application_args[0] == Bytes("read_incident"), read_incident],
        )]
    )

    return program

def clear_state_program():
    return Approve()
