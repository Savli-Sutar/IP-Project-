--INSERT SAMPLE USERS 
INSERT INTO USERS (name, email, password, role) VAlUES
('Savli Sutar', 'savlisutar@company.in', 'hashed_pass_1', 'Employee'),
('Ankit Suwasiya', 'ankitsuwasiya@company.in', 'hashed_pass_2', 'IT Support Staff'),
('Pawan Suthar', 'pawansuthar@company.in', 'hashed_pass_3', 'Administrator');
-- INSERT SLA RULES BASED ON PRIORITY
INSERT INTO sla_rules (priority, response_time_limit, resolution_time_limit) VALUES
('Critical', '1 Hour', '4 Hours'),
('High', '2 Hours', '8 Hours'),
('Medium', '4 Hours', '24 Hours'),
('Low', '8 Hours', '48 Hours');
--INSERT SAMPLE TICKETS RAISED BY USERS
INSERT INTO tickets (title, description, category, priority, status, user_id) VALUES
('Email Access Error', 'Cannot log into corporate webmail after password reset.', 'Software', 'High', 'Open', 1),
('VPN Disconnecting', 'VPN drops connection every 10 minutes.', 'Network', 'Critical', 'In Progress', 1);
--INSERT STATUS TRACKING HISTORY
INSERT INTO status_history (ticket_id, old_status, new_status) VALUES 
(2, 'Open', 'In Progress');
-- View all tickets with the name of the user who raised them and SLA details
SELECT 
    t.ticket_id, 
    t.title, 
    t.category, 
    t.priority, 
    t.status, 
    u.name AS raised_by, 
    s.resolution_time_limit,
    t.created_at
FROM tickets t
JOIN users u ON t.user_id = u.user_id
LEFT JOIN sla_rules s ON t.priority = s.priority;

-- View status history log for a specific ticket (e.g., Ticket ID 2)
SELECT 
    sh.history_id, 
    sh.ticket_id, 
    sh.old_status, 
    sh.new_status, 
    sh.changed_at
FROM status_history sh
WHERE sh.ticket_id = 2;
